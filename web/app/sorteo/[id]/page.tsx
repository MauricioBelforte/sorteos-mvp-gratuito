"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSorteo } from '@/lib/api';

export default function SorteoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sorteo, setSorteo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSorteo();
  }, [params.id]);

  async function cargarSorteo() {
    try {
      const data = await obtenerSorteo(params.id);
      setSorteo(data);
    } catch (err: any) {
      console.error('Error cargando sorteo:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!sorteo) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Sorteo no encontrado</div>;
  }

  const certificado = sorteo.certificados?.[0];
  const ganadores = certificado ? JSON.parse(certificado.ganadores) : [];
  const suplentes = certificado ? JSON.parse(certificado.suplentes) : [];

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <button onClick={() => router.push('/dashboard')} style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        ← Volver al dashboard
      </button>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{sorteo.titulo}</h1>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          {sorteo.redSocial} - {new Date(sorteo.createdAt).toLocaleString()}
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>Estado:</strong> <span style={{ color: sorteo.estado === 'completado' ? 'green' : 'orange' }}>{sorteo.estado}</span>
        </p>
        {sorteo.hashVerificacion && (
          <p style={{ fontSize: '0.9rem', color: '#666', wordBreak: 'break-all' }}>
            <strong>Hash de verificación:</strong> {sorteo.hashVerificacion}
          </p>
        )}
      </div>

      {sorteo.estado === 'completado' && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>🏆 Ganadores ({ganadores.length})</h2>
            {ganadores.length === 0 ? (
              <p style={{ color: '#666' }}>No hay ganadores</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {ganadores.map((ganador: string, index: number) => (
                  <li key={index} style={{ padding: '10px', background: '#f8f9fa', marginBottom: '5px', borderRadius: '4px' }}>
                    #{index + 1} - {ganador}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {suplentes.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: '15px' }}>🔄 Suplentes ({suplentes.length})</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {suplentes.map((suplente: string, index: number) => (
                  <li key={index} style={{ padding: '10px', background: '#f8f9fa', marginBottom: '5px', borderRadius: '4px' }}>
                    #{index + 1} - {suplente}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
