'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

interface SorteoFormProps {
  onResultado: (resultado: any) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const redesSociales = [
  { id: 'instagram', nombre: 'Instagram', dominio: 'instagram.com', color: 'text-pink-500' },
  { id: 'tiktok', nombre: 'TikTok', dominio: 'tiktok.com', color: 'text-cyan-400' },
  { id: 'youtube', nombre: 'YouTube', dominio: 'youtube.com', color: 'text-red-500' },
];

function detectarRedSocial(url: string): string {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return '';
}

export default function SorteoForm({ onResultado }: SorteoFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redDetectada = detectarRedSocial(url);
  const redInfo = redesSociales.find((r) => r.id === redDetectada);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    onResultado(null);

    try {
      if (!redDetectada) {
        setError('URL no válida. Debe ser de Instagram, TikTok o YouTube');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/sorteos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlPublicacion: url,
          redSocial: redDetectada,
          cantidadGanadores: 1,
          cantidadSuplentes: 0,
        }),
      });

      const data = await response.json();

      if (data.requierePago || data.sorteo) {
        onResultado(data);
      } else {
        setError(data.error || 'Error al crear sorteo');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        type="url"
        value={url}
        onChange={setUrl}
        label="URL de la publicación"
        placeholder="https://instagram.com/p/..."
        disabled={loading}
        error={url.trim() && !redDetectada ? 'URL no válida. Debe ser de Instagram, TikTok o YouTube' : undefined}
        icon={
          redInfo ? (
            <span className={`text-sm font-semibold ${redInfo.color}`}>{redInfo.nombre}</span>
          ) : undefined
        }
      />

      {redInfo && (
        <p className="text-sm text-green-600 flex items-center gap-2 fade-in">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Red social detectada: {redInfo.nombre}
        </p>
      )}

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={!url.trim() || (!redDetectada && url.trim().length > 0)}
        className="w-full"
      >
        {loading ? 'Procesando...' : 'Crear Sorteo'}
      </Button>
    </form>
  );
}
