'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { estadoPase, verificarPago } from '../../lib/sorteos';

type EstadoVista = 'verificando' | 'pendiente' | 'fallido' | 'error';

/**
 * Página de retorno del checkout de MercadoPago (back_urls del Pase Rápido).
 * Verifica el pago contra la API (o el estado del pase) y, si quedó aprobado,
 * guarda el pase en localStorage y vuelve a la home para que el SorteoWizard
 * lo active y restaure el contexto del sorteo.
 */
export default function PagoPage() {
  const [vista, setVista] = useState<EstadoVista>('verificando');
  const [mensaje, setMensaje] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verificar = async () => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paseId = params.get('paseId');
    const paymentId = params.get('payment_id') || params.get('collection_id');
    if (!paseId) {
      setVista('error');
      setMensaje('Falta el identificador del pase');
      return;
    }

    setVista('verificando');
    setMensaje('');
    try {
      const data = paymentId
        ? await verificarPago(paseId, paymentId)
        : await estadoPase(paseId);
      if (!data) {
        setVista('error');
        setMensaje('No se pudo verificar el pago. Intentalo de nuevo.');
        return;
      }
      if (data.estado === 'aprobado') {
        window.localStorage.setItem('sorteos_pase_id', paseId);
        window.location.href = '/';
        return;
      }
      setVista('pendiente');
      setMensaje('MercadoPago todavía no confirma el pago. Puede tardar unos segundos; seguimos verificando automáticamente.');
      timerRef.current = setTimeout(verificar, 5000);
    } catch (err: any) {
      setVista('error');
      setMensaje(err.message || 'No se pudo verificar el pago');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const estadoBack = params.get('estado');
    if (estadoBack === 'failure') {
      setVista('fallido');
      setMensaje('El pago no se completó. Podés volver e intentar de nuevo.');
      return;
    }
    void verificar();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <main className="container py-16 sm:py-24">
      <section aria-label="Resultado del pago" className="max-w-md mx-auto">
        <Card padding="md" hover={false} className="p-8 animate-fade-in">
          {vista === 'verificando' && (
            <div className="text-center space-y-4">
              <Loader size="lg" color="primary" className="mx-auto" />
              <h1 className="text-xl font-bold text-gray-900">Verificando tu pago...</h1>
              <p className="text-sm text-gray-500">
                Estamos confirmando el pago del Pase Rápido con MercadoPago.
              </p>
            </div>
          )}

          {vista === 'pendiente' && (
            <div className="text-center space-y-4">
              <Loader size="lg" color="warning" className="mx-auto" />
              <h1 className="text-xl font-bold text-gray-900">Pago pendiente de confirmación</h1>
              <p className="text-sm text-gray-600">{mensaje}</p>
              <Button variant="outline" onClick={verificar} className="w-full">
                Verificar de nuevo
              </Button>
              <p className="text-xs text-gray-400">
                Si ya pagaste, el pase se activará solo en cuanto se confirme. Podés cerrar esta página y volver.
              </p>
            </div>
          )}

          {vista === 'fallido' && (
            <div className="text-center space-y-4">
              <span className="text-4xl" aria-hidden="true">😕</span>
              <h1 className="text-xl font-bold text-gray-900">El pago no se completó</h1>
              <p className="text-sm text-gray-600">{mensaje}</p>
              <a href="/" className="block">
                <Button className="w-full">Volver e intentar de nuevo</Button>
              </a>
              <p className="text-xs text-gray-400">
                No se te cobró nada. El sorteo sigue disponible con la cuota gratuita o entrando en la cola.
              </p>
            </div>
          )}

          {vista === 'error' && (
            <div className="text-center space-y-4">
              <span className="text-4xl" aria-hidden="true">⚠️</span>
              <h1 className="text-xl font-bold text-gray-900">No pudimos verificar el pago</h1>
              <p className="text-sm text-gray-600">{mensaje}</p>
              <Button variant="outline" onClick={verificar} className="w-full">
                Reintentar
              </Button>
              <a href="/" className="block">
                <Button variant="ghost" className="w-full">Volver al sorteo</Button>
              </a>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
