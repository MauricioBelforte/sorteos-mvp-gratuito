'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import ResultCard from './ResultCard';
import RuletaGanadores from './RuletaGanadores';
import { analizarPublicacion, crearSorteo, detectarRedSocial, getRedInfo, estadoInstagram, conectarInstagram, desconectarInstagram, estadoCuota, entrarCola, estadoCola, crearPasePago, deduplicarParticipantes } from '../../lib/sorteos';

export default function SorteoWizard() {
  const [url, setUrl] = useState('');
  const [modoManual, setModoManual] = useState(false);
  const [comentariosManuales, setComentariosManuales] = useState('');
  const [mostrarCookies, setMostrarCookies] = useState(false);
  const [cookiesInstagram, setCookiesInstagram] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [eliminarDuplicados, setEliminarDuplicados] = useState(true);
  const [analizando, setAnalizando] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  // Pool crudo del scrapeo (con repetidos): el toggle "eliminar duplicados" se
  // aplica localmente sobre esta lista, sin volver a scrapear la publicación.
  const [poolCrudo, setPoolCrudo] = useState<any[] | null>(null);
  const [ganadores, setGanadores] = useState(1);
  const [suplentes, setSuplentes] = useState(1);
  const [sorteando, setSorteando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [mostrandoRuleta, setMostrandoRuleta] = useState(false);
  const [imagenRota, setImagenRota] = useState(false);
  const [verComentarios, setVerComentarios] = useState(false);
  const [listaCopiada, setListaCopiada] = useState(false);
  const [error, setError] = useState('');
  const [sesionIg, setSesionIg] = useState<any>(null);
  const [conectandoIg, setConectandoIg] = useState(false);
  const [cuota, setCuota] = useState<any>(null);
  const [cuotaAgotada, setCuotaAgotada] = useState<any>(null);
  const [solicitudCola, setSolicitudCola] = useState<any>(null);
  const [paseActivado, setPaseActivado] = useState(false);
  const [paseId, setPaseId] = useState<string | null>(null);
  const [pagandoPase, setPagandoPase] = useState(false);

  const redDetectada = detectarRedSocial(url);
  const redInfo = getRedInfo(redDetectada);
  // Opción avanzada de pegar cookies/sessionid: SOLO visible si se setea
  // NEXT_PUBLIC_COOKIES_AVANZADAS=true (para pruebas internas). En producción
  // queda oculta para el público.
  const cookiesAvanzadasVisible = process.env.NEXT_PUBLIC_COOKIES_AVANZADAS === 'true';

  useEffect(() => {
    estadoCuota().then(setCuota).catch(() => setCuota(null));
  }, []);

  useEffect(() => {
    if (redDetectada === 'instagram') {
      estadoInstagram().then(setSesionIg).catch(() => setSesionIg(null));
    } else {
      setSesionIg(null);
    }
  }, [redDetectada]);

  // Polling del estado de la cola mientras está pendiente
  useEffect(() => {
    if (!solicitudCola || !['pendiente', 'procesando'].includes(solicitudCola.estado)) return;
    const intervalo = setInterval(async () => {
      const estado = await estadoCola(solicitudCola.id).catch(() => null);
      if (estado) setSolicitudCola(estado);
    }, 10000);
    return () => clearInterval(intervalo);
  }, [solicitudCola]);

  // Restaurar el sorteo tras volver del pago de MercadoPago.
  // /pago guarda `sorteos_pase_id` si el pago quedó aprobado; acá recuperamos
  // el contexto del sorteo y re-analizamos con el Pase Rápido activo.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const paseIdGuardado = window.localStorage.getItem('sorteos_pase_id');
    if (!paseIdGuardado) return;

    const ctxRaw = window.localStorage.getItem('sorteos_pase_ctx');
    let ctx: any = null;
    if (ctxRaw) {
      try {
        ctx = JSON.parse(ctxRaw);
      } catch {
        ctx = null;
      }
    }

    window.localStorage.removeItem('sorteos_pase_id');
    setPaseId(paseIdGuardado);
    setPaseActivado(true);

    if (ctx) {
      if (ctx.url) setUrl(ctx.url);
      if (ctx.modoManual) {
        setModoManual(true);
        setComentariosManuales(ctx.comentarios || '');
      }
      if (ctx.cookies) setCookiesInstagram(ctx.cookies);
      if (ctx.sessionId) setSessionId(ctx.sessionId);
      if (typeof ctx.eliminarDuplicados === 'boolean') setEliminarDuplicados(ctx.eliminarDuplicados);
      if (typeof ctx.cantidadGanadores === 'number') setGanadores(ctx.cantidadGanadores);
      if (typeof ctx.cantidadSuplentes === 'number') setSuplentes(ctx.cantidadSuplentes);
    }

    // Re-analizar con el pase aprobado para reconstruir el preview automáticamente
    setAnalizando(true);
    const manejarRestauracion = async () => {
      try {
        const manuales = ctx?.modoManual
          ? (ctx.comentarios || '')
              .split('\n')
              .map((l: string) => l.trim())
              .filter((l: string) => l.length > 0)
          : undefined;
        const data = await analizarPublicacion(
          ctx?.url || '',
          manuales,
          ctx?.cookies || '',
          false,
          ctx?.sessionId || '',
          true,
          paseIdGuardado
        );
        setPoolCrudo(data.participantes || []);
        const visibles = ctx?.eliminarDuplicados !== false ? deduplicarParticipantes(data.participantes || []) : data.participantes || [];
        setPreview({ ...data, participantes: visibles, cantidadComentarios: visibles.length });
      } catch (err: any) {
        setError(err.message || 'Error al restaurar la publicación tras el pago');
      } finally {
        setAnalizando(false);
      }
    };
    window.setTimeout(manejarRestauracion, 0);
  }, []);

  const handleConectarIg = async () => {
    setConectandoIg(true);
    setError('');
    try {
      const data = await conectarInstagram();
      setSesionIg({ conectado: true, usuario: data.usuario });
      setMostrarCookies(false);
      setCookiesInstagram('');
    } catch (err: any) {
      setError(err.message || 'Error al conectar Instagram');
    } finally {
      setConectandoIg(false);
    }
  };

  const handleDesconectarIg = async () => {
    setConectandoIg(true);
    setError('');
    try {
      await desconectarInstagram();
      setSesionIg(null);
    } catch (err: any) {
      setError(err.message || 'Error al desconectar Instagram');
    } finally {
      setConectandoIg(false);
    }
  };

  const lineasManuales = () =>
    comentariosManuales
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  // Aplica el toggle "eliminar duplicados" a nivel local (sin re-scrapear):
  // con ON se filtran los pares usuario|comentario repetidos del pool crudo.
  const aplicarDedupeLocal = (crudo: any[], activado: boolean) => {
    const visibles = activado ? deduplicarParticipantes(crudo) : crudo;
    setPreview((prev: any) => prev && { ...prev, participantes: visibles, cantidadComentarios: visibles.length });
  };

  const ejecutarAnalisis = async (eliminarDup: boolean) => {
    setAnalizando(true);
    setError('');
    setPreview(null);
    setResultado(null);
    setCuotaAgotada(null);
    setMostrandoRuleta(false);
    setImagenRota(false);
    setVerComentarios(false);

    try {
      const manuales = modoManual ? lineasManuales() : undefined;
      if (modoManual && (!manuales || manuales.length === 0)) {
        throw new Error('Pegá al menos un comentario en el cuadro de texto');
      }
      const data = await analizarPublicacion(url, manuales, cookiesInstagram, eliminarDup, sessionId, paseActivado, paseId ?? undefined);
      if (data.requierePago && data.motivo === 'cuota') {
        setCuotaAgotada(data);
        return;
      }
      // Guardar el pool crudo (sin dedupe) y mostrar la vista según el toggle actual
      setPoolCrudo(data.participantes || []);
      const visibles = eliminarDup ? deduplicarParticipantes(data.participantes || []) : data.participantes || [];
      setPreview({ ...data, participantes: visibles, cantidadComentarios: visibles.length });
    } catch (err: any) {
      setError(err.message || 'Error al analizar la publicación');
    } finally {
      setAnalizando(false);
    }
  };

  const handleAnalizar = (e: React.FormEvent) => {
    e.preventDefault();
    void ejecutarAnalisis(eliminarDuplicados);
  };

  // Al alternar el toggle en el paso 2 NO se vuelve a scrapear: se filtra el
  // pool crudo que ya trajo el análisis (dedupe local, misma lógica que el backend).
  const handleToggleDuplicados = (checked: boolean) => {
    setEliminarDuplicados(checked);
    if (poolCrudo) aplicarDedupeLocal(poolCrudo, checked);
  };

  const handleSortear = async () => {
    setSorteando(true);
    setError('');
    setResultado(null);
    setCuotaAgotada(null);
    setMostrandoRuleta(false);

    try {
      const data = await crearSorteo({
        urlPublicacion: url,
        redSocial: redDetectada || 'instagram',
        cantidadGanadores: ganadores,
        cantidadSuplentes: suplentes,
        participantesManuales: modoManual ? lineasManuales() : undefined,
        cookiesInstagram: redDetectada === 'instagram' ? cookiesInstagram : undefined,
        eliminarDuplicados,
        participantesPrecargados: preview?.participantes,
        sessionId: redDetectada === 'instagram' ? sessionId : undefined,
        paseAprobado: paseActivado,
        paseId: paseId ?? undefined,
      });

      if (data.requierePago && data.motivo === 'pase_invalido') {
        setPaseActivado(false);
        setPaseId(null);
        setCuotaAgotada(data);
      } else if (data.requierePago && data.motivo === 'cuota') {
        setCuotaAgotada(data);
      } else if (data.requierePago) {
        setResultado(data);
      } else if (data.sorteo) {
        // Adjuntar los comentarios al resultado para mostrar el comentario del ganador
        setResultado({ ...data, comentarios: preview?.participantes || data.comentarios || [] });
        setMostrandoRuleta(true);
      } else {
        setError(data.error || 'Error al crear sorteo');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setSorteando(false);
    }
  };

  // Pase Rápido: crea la preferencia de pago en MercadoPago y redirige al checkout.
  // Al volver (back_url a /pago), la página /pago verifica el pago y, si quedó
  // aprobado, guarda `sorteos_pase_id` y el contexto del sorteo en localStorage.
  // El effect de restauración (más arriba) reconstruye el preview y activa el pase.
  const handlePagarPase = async () => {
    setPagandoPase(true);
    setError('');
    try {
      const pago = await crearPasePago();
      const contexto = {
        url,
        modoManual,
        comentarios: comentariosManuales,
        cookies: cookiesInstagram,
        sessionId,
        eliminarDuplicados,
        cantidadGanadores: ganadores,
        cantidadSuplentes: suplentes,
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sorteos_pase_ctx', JSON.stringify(contexto));
        window.location.href = pago.initPoint || pago.sandboxInitPoint;
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar el pago en MercadoPago');
      setPagandoPase(false);
    }
  };

  const handleEntrarEnCola = async () => {
    setSorteando(true);
    setError('');
    try {
      const solicitud = await entrarCola({
        urlPublicacion: url,
        redSocial: redDetectada || 'instagram',
        cantidadGanadores: ganadores,
        cantidadSuplentes: suplentes,
        eliminarDuplicados,
      });
      setCuotaAgotada(null);
      setSolicitudCola(solicitud);
    } catch (err: any) {
      setError(err.message || 'Error al entrar en la cola');
    } finally {
      setSorteando(false);
    }
  };

  const formatoEspera = (fecha: string | null) => {
    if (!fecha) return '';
    const diff = new Date(fecha).getTime() - Date.now();
    if (diff <= 0) return 'en cualquier momento';
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    if (horas > 0) return `en ~${horas}h ${minutos}min`;
    return `en ~${minutos}min`;
  };

  const handleReiniciar = () => {
    setPreview(null);
    setPoolCrudo(null);
    setResultado(null);
    setMostrandoRuleta(false);
    setImagenRota(false);
    setVerComentarios(false);
    setGanadores(1);
    setSuplentes(1);
    setError('');
    setCuotaAgotada(null);
    setSolicitudCola(null);
    setPaseActivado(false);
    setPaseId(null);
  };

  const sinComentarios = preview && preview.cantidadComentarios === 0;

  return (
    <div className="space-y-5">
      {/* Paso 1: Analizar publicación */}
      {!preview && (
        <form onSubmit={handleAnalizar} className="space-y-4" noValidate>
          <Input
            type="url"
            value={url}
            onChange={setUrl}
            label="URL de la publicación"
            placeholder="https://instagram.com/p/..."
            disabled={analizando}
            error={
              !modoManual && url.trim() && !redDetectada
                ? 'URL no válida. Debe ser de Instagram, TikTok o YouTube'
                : undefined
            }
            icon={
              redInfo && !modoManual ? (
                <span className={`text-sm font-semibold ${redInfo.color}`}>{redInfo.nombre}</span>
              ) : undefined
            }
          />

          {!modoManual && redInfo && (
            <p className="text-sm text-green-600 flex items-center gap-2 fade-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Red social detectada: {redInfo.nombre}
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={() => setModoManual(!modoManual)}
              disabled={analizando}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 transition-colors"
            >
              {modoManual
                ? '← Volver al análisis automático'
                : '¿La publicación no se analiza? Pegá los comentarios manualmente'}
            </button>

            {modoManual && (
              <div className="mt-3 space-y-2 fade-in">
                <label htmlFor="comentarios-manuales" className="block text-sm font-semibold text-gray-700">
                  Comentarios (uno por línea)
                </label>
                <textarea
                  id="comentarios-manuales"
                  value={comentariosManuales}
                  onChange={(e) => setComentariosManuales(e.target.value)}
                  disabled={analizando}
                  rows={6}
                  placeholder={'@usuario comentario\n@otro_usuario otro comentario\nO solo el comentario, sin usuario'}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-250 bg-white font-mono text-sm text-gray-800 resize-y"
                />
                <p className="text-xs text-gray-500">
                  Si escribís <span className="font-semibold">@usuario</span> al inicio de la línea, ese es el participante.
                  Sin usuario, se usará <span className="font-semibold">Anónimo N</span> con tu comentario.
                </p>
              </div>
            )}
          </div>

          {!modoManual && redDetectada === 'instagram' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              {sesionIg?.conectado ? (
                <div className="flex items-center justify-between gap-2 fade-in">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Sesión de Instagram conectada: <span className="font-semibold">@{sesionIg.usuario}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleDesconectarIg}
                    disabled={conectandoIg}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors"
                  >
                    {conectandoIg ? 'Desconectando...' : 'Desconectar'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-amber-800">
                    ¿Ves pocos comentarios? <span className="font-semibold">Conectá tu cuenta de Instagram</span> para recolectar TODOS
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    loading={conectandoIg}
                    onClick={handleConectarIg}
                    disabled={analizando || conectandoIg}
                    className="shrink-0"
                  >
                    {conectandoIg ? 'Conectando...' : 'Conectar mi cuenta'}
                  </Button>
                </div>
              )}

              {cookiesAvanzadasVisible && !sesionIg?.conectado && (
                <button
                  type="button"
                  onClick={() => setMostrarCookies(!mostrarCookies)}
                  disabled={analizando}
                  className="w-full text-left text-xs text-amber-700 hover:text-amber-900 flex items-center justify-between gap-2"
                >
                  <span>O pegá tus cookies manualmente (opción avanzada)</span>
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform ${mostrarCookies ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {cookiesAvanzadasVisible && mostrarCookies && (
                <div className="mt-3 space-y-2 fade-in">
                  <ol className="list-decimal list-inside text-xs text-amber-800 space-y-1">
                    <li>Entrá a <span className="font-semibold">instagram.com</span> desde Chrome/Edge (logueado)</li>
                    <li>Presioná <span className="font-semibold">F12</span> → pestaña <span className="font-semibold">Network</span> (Red) → recargá la página</li>
                    <li>Hacé clic en cualquier request de <span className="font-semibold">www.instagram.com</span></li>
                    <li>Copiá el valor completo de <span className="font-semibold">Cookie:</span> (en Request Headers) y pegálo abajo</li>
                  </ol>
                  <textarea
                    id="cookies-instagram"
                    value={cookiesInstagram}
                    onChange={(e) => setCookiesInstagram(e.target.value)}
                    disabled={analizando}
                    rows={3}
                    placeholder={'ig_did=...; csrftoken=...; sessionid=...; ds_user_id=...'}
                    className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-250 bg-white font-mono text-xs text-gray-800 resize-y"
                  />
                  <p className="text-xs text-amber-700">
                    Se usan solo para esta recolección en tu servidor local y no se guardan. Sin cookies, Instagram
                    muestra como máximo los primeros comentarios.
                  </p>
                  <div className="border-t border-amber-200 pt-3 space-y-2">
                    <label htmlFor="session-id" className="block text-xs font-semibold text-amber-800">
                      …o pegá solo el Session ID (más fácil y suficiente)
                    </label>
                    <input
                      id="session-id"
                      type="text"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      disabled={analizando}
                      placeholder={'6123456789%3AabcXYZ%3A2'}
                      className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-250 bg-white font-mono text-xs text-gray-800"
                    />
                    <ol className="list-decimal list-inside text-xs text-amber-800 space-y-1">
                      <li>En Chrome logueado en Instagram: <span className="font-semibold">F12</span> → pestaña <span className="font-semibold">Application</span></li>
                      <li><span className="font-semibold">Storage → Cookies → instagram.com</span></li>
                      <li>Copiá el <span className="font-semibold">valor</span> de la cookie <span className="font-semibold">sessionid</span> y pegalo arriba</li>
                    </ol>
                    <p className="text-xs text-amber-700">
                      Con el Session ID se recolectan TODOS los comentarios sin abrir Chrome y sin gastar créditos,
                      también en la versión desplegada en la nube. No se guarda en el servidor.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            size="lg"
            loading={analizando}
            disabled={
              analizando ||
              (!modoManual && (!url.trim() || (!redDetectada && url.trim().length > 0)))
            }
            className="w-full"
          >
            {analizando
              ? 'Analizando...'
              : modoManual
              ? 'Usar comentarios pegados'
              : 'Analizar publicación'}
          </Button>
        </form>
      )}

      {/* Cuota agotada: oferta de Pase Rápido o cola de espera */}
      {cuotaAgotada && !solicitudCola && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-4 fade-in">
          <div className="flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">⏳</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sorteos gratuitos de la nube agotados por hoy</h3>
              <p className="text-sm text-gray-600 mt-1">{cuotaAgotada.mensaje}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white border border-amber-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Pase Rápido</p>
              <p className="text-2xl font-extrabold text-amber-600">
                ${cuotaAgotada.precio.toLocaleString('es-AR')} <span className="text-sm font-semibold text-gray-500">ARS</span>
              </p>
              <p className="text-xs text-gray-500">Saltá la fila y sortea al instante. Cubre el costo del scraping externo (Apify).</p>
              <Button size="sm" loading={pagandoPase} onClick={handlePagarPase} className="w-full">
                {pagandoPase ? 'Creando pago...' : 'Pagar y sortear ya'}
              </Button>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Entrar en la cola</p>
              <p className="text-2xl font-extrabold text-green-600">Gratis</p>
              <p className="text-xs text-gray-500">
                Te lo procesamos automáticamente cuando se libere cuota (recálculo diario o renovación mensual).
              </p>
              <Button size="sm" variant="outline" loading={sorteando} onClick={handleEntrarEnCola} className="w-full">
                Entrar en la cola
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vista de cola: estado y espera */}
      {solicitudCola && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 space-y-3 fade-in">
          <div className="flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">🚶</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {solicitudCola.estado === 'completado'
                  ? '¡Tu sorteo está listo!'
                  : solicitudCola.estado === 'fallido'
                  ? 'El sorteo en cola falló'
                  : 'Estás en la cola'}
              </h3>
              {['pendiente', 'procesando'].includes(solicitudCola.estado) && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700">
                    Posición: <span className="font-extrabold text-green-700">{solicitudCola.posicion}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Disponible {solicitudCola.estado === 'procesando' ? 'en cualquier momento' : formatoEspera(solicitudCola.disponibleEn)}.
                    Esta página se actualiza sola; podés cerrarla y volver después.
                  </p>
                </div>
              )}
              {solicitudCola.estado === 'fallido' && (
                <p className="text-sm text-red-600 mt-1">{solicitudCola.error || 'Error desconocido'}</p>
              )}
            </div>
          </div>

          {solicitudCola.estado === 'completado' && solicitudCola.resultado?.sorteo && (
            <div className="rounded-xl bg-white border border-green-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Ganadores</p>
              <ul className="space-y-1">
                {(solicitudCola.resultado.sorteo.ganadores || []).map((g: string, i: number) => (
                  <li key={`${g}-${i}`} className="text-sm font-bold text-green-700">
                    {i + 1}. @{g.startsWith('@') ? g.slice(1) : g}
                  </li>
                ))}
              </ul>
              {(solicitudCola.resultado.sorteo.suplentes || []).length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Suplentes: {(solicitudCola.resultado.sorteo.suplentes || []).map((s: string) => `@${s.startsWith('@') ? s.slice(1) : s}`).join(', ')}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-3 break-all font-mono">
                Hash: {solicitudCola.resultado.sorteo.hashVerificacion}
              </p>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleReiniciar}>
            Analizar otra publicación
          </Button>
        </div>
      )}

      {/* Paso 2: Preview y configuración */}
      {preview && !resultado && (
        <div className="space-y-5 fade-in">
          {error && (
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {preview.imagen && !imagenRota ? (
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <img
                    src={preview.imagen}
                    alt="Imagen de la publicación"
                    className="w-full h-full object-cover"
                    onError={() => setImagenRota(true)}
                  />
                </div>
              ) : (
                <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br ${redInfo?.gradiente || 'from-indigo-500 to-purple-600'} flex items-center justify-center shadow-lg`}>
                  <span className="text-5xl font-extrabold text-white">
                    {redInfo ? redInfo.nombre.charAt(0) : 'S'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <span className="text-sm font-semibold text-gray-600">
                  Cantidad de comentarios:
                </span>
                <div className="flex items-center gap-3">
                  {!sinComentarios && (
                    <button
                      type="button"
                      onClick={() => setVerComentarios(!verComentarios)}
                      disabled={sorteando}
                      aria-expanded={verComentarios}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
                    >
                      {verComentarios ? 'Ocultar lista' : 'Ver lista'}
                    </button>
                  )}
                  <span className={`text-xl font-extrabold ${sinComentarios ? 'text-gray-400' : 'text-indigo-600'}`}>
                    {preview.cantidadComentarios.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {verComentarios && !sinComentarios && (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden fade-in">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-between">
                    <span>
                      Lista completa de comentarios ({preview.cantidadComentarios.toLocaleString('es-AR')})
                    </span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const texto = (preview.participantes || [])
                            .map((p: any) => {
                              const usuario = p?.usuario && p.usuario.startsWith('@') ? p.usuario : `@${p?.usuario || ''}`;
                              return `${usuario} | ${p?.comentario || ''}`;
                            })
                            .join('\n');
                          navigator.clipboard.writeText(texto).then(() => {
                            setListaCopiada(true);
                            window.setTimeout(() => setListaCopiada(false), 2000);
                          }).catch(() => setListaCopiada(false));
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {listaCopiada ? '✓ ¡Copiada!' : 'Copiar lista'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerComentarios(false)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Cerrar
                      </button>
                    </span>
                  </div>
                  <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {(preview.participantes || []).map((p: any, i: number) => (
                      <li key={`${i}-${p?.usuario || ''}`} className="px-4 py-2 text-sm flex gap-2">
                        <span className="font-bold text-indigo-600 shrink-0">
                          @{p?.usuario && p.usuario.startsWith('@') ? p.usuario.slice(1) : p?.usuario || `Anónimo ${i + 1}`}
                        </span>
                        <span className="text-gray-600 break-words">{p?.comentario || ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!sinComentarios && preview.sesion && preview.sesion !== 'manual' && (
                <div className={`rounded-xl px-4 py-2 text-xs font-semibold border ${
                  preview.sesion === 'anonima' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                  {preview.sesion === 'anonima'
                    ? 'Sesión anónima: Instagram limita a los primeros comentarios. Conectá tu cuenta para recolectar TODOS.'
                    : preview.sesion === 'guardada'
                    ? 'Recolección con tu sesión de Instagram guardada: se recolectaron TODOS los comentarios.'
                    : 'Recolección con cookies pegadas: se recolectaron TODOS los comentarios.'}
                </div>
              )}

              {sinComentarios && (
                <Alert variant="warning">
                  No se encontraron participantes en esta publicación. Instagram limita la recolección automática sin sesión:
                  probá con otra publicación, conectá tu sesión de Instagram (la opción amarilla del paso anterior),
                  o usá la opción <span className="font-semibold">“Pegar comentarios manualmente”</span>.
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cantidad-ganadores" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad de Ganadores
                  </label>
                  <select
                    id="cantidad-ganadores"
                    value={ganadores}
                    onChange={(e) => setGanadores(Number(e.target.value))}
                    disabled={sorteando}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-250 bg-white font-semibold text-gray-800"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cantidad-suplentes" className="block text-sm font-semibold text-gray-700 mb-2">
                    ¿Cuántos suplentes?
                  </label>
                  <select
                    id="cantidad-suplentes"
                    value={suplentes}
                    onChange={(e) => setSuplentes(Number(e.target.value))}
                    disabled={sorteando}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-250 bg-white font-semibold text-gray-800"
                  >
                    {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 cursor-pointer select-none hover:border-indigo-200 transition-colors">
                <input
                  type="checkbox"
                  checked={eliminarDuplicados}
                  onChange={(e) => handleToggleDuplicados(e.target.checked)}
                  disabled={sorteando || analizando}
                  className="mt-0.5 w-4 h-4 accent-indigo-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Eliminar duplicados</span>
                  <span className="block text-xs text-gray-500">
                    Si una persona comentó lo mismo varias veces, se cuenta una sola vez.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {cuota && cuota.cuotaMensual > 0 && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2 text-xs text-indigo-700 flex items-center justify-between">
              <span>
                Sorteos gratuitos de la nube disponibles hoy: <span className="font-extrabold">{cuota.cuotaHoy}</span>
                <span className="text-indigo-400"> (usados este mes: {cuota.usosMes} de {cuota.cuotaMensual})</span>
              </span>
              {paseActivado && (
                <span className="font-semibold text-green-600 bg-green-100 rounded-full px-2 py-0.5">
                  Pase Rápido activo
                </span>
              )}
            </div>
          )}

          <Button
            size="lg"
            loading={sorteando}
            disabled={sinComentarios || sorteando}
            onClick={handleSortear}
            className="w-full"
          >
            {sorteando ? 'Sorteando...' : 'Sortear'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleReiniciar}
              disabled={sorteando}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Analizar otra publicación
            </button>
          </div>
        </div>
      )}

      {/* Animación del sorteo */}
      {resultado && mostrandoRuleta && resultado.sorteo && (
        <div className="space-y-5">
          <RuletaGanadores
            participantes={preview?.participantes || resultado.sorteo.ganadores}
            ganadores={resultado.sorteo.ganadores}
            redSocial={redDetectada}
            onTerminar={() => setMostrandoRuleta(false)}
          />
        </div>
      )}

      {/* Resultado */}
      {resultado && !mostrandoRuleta && (
        <div className="fade-in">
          <ResultCard resultado={resultado} onReiniciar={handleReiniciar} />
        </div>
      )}
    </div>
  );
}
