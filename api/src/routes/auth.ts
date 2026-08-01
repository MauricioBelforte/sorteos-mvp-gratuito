import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateToken, hashPassword, comparePassword } from '../lib/auth';
import { AuthRequest } from '../lib/middleware';
import { authMiddleware } from '../lib/middleware';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nombre } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }
    
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }
    
    const hashedPassword = await hashPassword(password);
    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
      },
    });
    
    const token = generateToken(usuario.id);
    res.json({ token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }
    
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    if (usuario.bloqueado) {
      res.status(403).json({ error: 'Usuario bloqueado' });
      return;
    }
    
    const validPassword = await comparePassword(password, usuario.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const token = generateToken(usuario.id);
    res.json({ token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, nombre: true, rol: true, bloqueado: true },
    });
    
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    res.json(usuario);
  } catch (error: any) {
    console.error('Error en /me:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;
