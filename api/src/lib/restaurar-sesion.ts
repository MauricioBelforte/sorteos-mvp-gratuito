import fs from 'fs';
import path from 'path';

// Render free pierde el filesystem con cada redeploy: la sesión de Instagram
// (.instagram-session.json) desaparece al desplegar. Para que la sesión del
// dueño sobreviva a los deploys, se guarda codificada en base64 dentro de una
// variable de entorno y se reconstruye aquí al arrancar.
const SESSION_PATH = path.join(process.cwd(), '.instagram-session.json');
const INFO_PATH = path.join(process.cwd(), '.instagram-session-info.json');

export function restaurarSesionInstagram(): void {
  const sesionB64 = process.env.IG_SESION_B64;
  const infoB64 = process.env.IG_SESION_INFO_B64;
  try {
    if (sesionB64 && !fs.existsSync(SESSION_PATH)) {
      fs.writeFileSync(SESSION_PATH, Buffer.from(sesionB64, 'base64').toString('utf-8'));
      console.log('Instagram: sesión restaurada desde IG_SESION_B64');
    }
    if (infoB64 && !fs.existsSync(INFO_PATH)) {
      fs.writeFileSync(INFO_PATH, Buffer.from(infoB64, 'base64').toString('utf-8'));
      console.log('Instagram: info de sesión restaurada desde IG_SESION_INFO_B64');
    }
  } catch (e) {
    console.error('Instagram: error restaurando sesión desde variables:', (e as Error).message);
  }
}