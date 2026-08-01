const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchAPI(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Error en la solicitud');
  }
  
  return data;
}

export async function register(email: string, password: string, nombre?: string) {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nombre }),
  });
}

export async function login(email: string, password: string) {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function crearSorteo(
  token: string,
  titulo: string,
  urlPublicacion: string,
  redSocial: string,
  cantidadGanadores: number,
  cantidadSuplentes: number
) {
  return fetchAPI('/api/sorteos', {
    method: 'POST',
    token,
    body: JSON.stringify({
      titulo,
      urlPublicacion,
      redSocial,
      cantidadGanadores,
      cantidadSuplentes,
    }),
  });
}

export async function listarSorteos(token: string) {
  return fetchAPI('/api/sorteos', { token });
}

export async function obtenerSorteo(id: string) {
  return fetchAPI(`/api/sorteos/${id}`);
}
