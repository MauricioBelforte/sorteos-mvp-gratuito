"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
      const data = await register(email, password, nombre);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="card">
        {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Crear cuenta</button>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          ¿Ya tenés cuenta? <a href="/auth/login">Iniciá sesión</a>
        </p>
      </form>
    </div>
  );
}
