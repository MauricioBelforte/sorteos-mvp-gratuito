"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crearSorteo, listarSorteos } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [urlPublicacion, setUrlPublicacion] = useState('');
  const [redSocial, setRedSocial] = useState('instagram');
  const [cantidadGanadores, setCantidadGanadores] = useState(1);
  const [cantidadSuplentes, setCantidadSuplentes] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sorteos, setSorteos] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    cargarSorteos();
  }, [router]);

  async function cargarSorteos() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const data = await listarSorteos(token);
        setSorteos(data);
      }
    } catch (err: any) {
      console.error('Error cargando sorteos:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const data = await crearSorteo(token, titulo, urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes);
      router.push(`/sorteo/${data.sorteo.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <h2 style={{ marginBottom: '20px' }}>Crear nuevo sorteo</h2>
          <form onSubmit={handleSubmit} className="card">
            {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
            <div className="form-group">
              <label htmlFor="titulo">Título del sorteo</label>
              <input id="titulo" type="text" className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="redSocial">Red social</label>
              <select id="redSocial" className="input" value={redSocial} onChange={(e) => setRedSocial(e.target.value)}>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="url">Link de la publicación</label>
              <input id="url" type="url" className="input" value={urlPublicacion} onChange={(e) => setUrlPublicacion(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="ganadores">Ganadores</label>
                <input id="ganadores" type="number" className="input" min={1} value={cantidadGanadores} onChange={(e) => setCantidadGanadores(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label htmlFor="suplentes">Suplentes</label>
                <input id="suplentes" type="number" className="input" min={0} value={cantidadSuplentes} onChange={(e) => setCantidadSuplentes(Number(e.target.value))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creando sorteo...' : 'Crear sorteo'}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ marginBottom: '20px' }}>Mis sorteos</h2>
          <div className="card">
            {sorteos.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No hay sorteos aún</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sorteos.map((sorteo) => (
                  <div key={sorteo.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} onClick={() => router.push(`/sorteo/${sorteo.id}`)}>
                    <h3 style={{ marginBottom: '5px' }}>{sorteo.titulo}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      {sorteo.redSocial} - {new Date(sorteo.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: sorteo.estado === 'completado' ? 'green' : 'orange' }}>
                      Estado: {sorteo.estado}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
