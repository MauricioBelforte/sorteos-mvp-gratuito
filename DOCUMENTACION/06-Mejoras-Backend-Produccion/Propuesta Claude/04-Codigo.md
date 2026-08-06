# 04 - Código: Captura Completa de Comentarios de Instagram

## Archivos Involucrados

### Archivos a CREAR (nuevos)

| Archivo | Propósito | Estrategia |
|---------|-----------|------------|
| `api/src/collectors/instagram-v2.ts` | Orquestador principal con cascada de estrategias | Todas |
| `api/src/collectors/strategies/graphql-intercept.ts` | Intercepción de respuestas GraphQL | A |
| `api/src/collectors/strategies/api-rest-inbrowser.ts` | Fetch de API REST dentro del browser | B |
| `api/src/collectors/strategies/dom-scroll.ts` | DOM scraping mejorado con scroll humano | C |
| `api/src/collectors/strategies/external-service.ts` | Integración con Apify/ScrapFly | D |
| `api/src/collectors/strategies/types.ts` | Interfaces compartidas entre estrategias | - |
| `api/src/collectors/parsers/instagram-paste.ts` | Parser de texto pegado manualmente | E |

### Archivos a MODIFICAR (mínimo)

| Archivo | Cambio | Riesgo |
|---------|--------|--------|
| `api/src/collectors/index.ts` | Cambiar import de `instagram` a `instagram-v2` | Bajo |

### Archivos que NO se tocan

| Archivo | Motivo |
|---------|--------|
| `api/src/collectors/instagram.ts` | Se mantiene como respaldo (regla 15 AGENTS.md) |
| `api/src/collectors/tiktok.ts` | No afectado |
| `api/src/collectors/youtube.ts` | No afectado |
| `api/src/routes/instagram.ts` | Rutas de login/logout/estado no cambian |

---

## Pseudocódigo Detallado

### `instagram-v2.ts` — Orquestador Principal

```typescript
import { Page, Browser, chromium } from 'playwright';
import { Participante } from './types';
import { estrategiaGraphQL } from './strategies/graphql-intercept';
import { estrategiaApiRestInBrowser } from './strategies/api-rest-inbrowser';
import { estrategiaDomScroll } from './strategies/dom-scroll';
import { estrategiaServicioExterno } from './strategies/external-service';
import { esUsernameValido, obtenerAutorInstagram, obtenerMediaId } from './instagram';
// Reutilizar funciones auxiliares del archivo original

const UMBRAL_MINIMO = 0.5; // Mínimo 50% de comentarios esperados
const TIMEOUT_GLOBAL = 120_000; // 2 minutos máximo

interface ContextoScraping {
  page: Page;
  url: string;
  shortcode: string;
  mediaId: string | null;
  autorExcluido: string;
  cantidadMaxima: number;
  tieneSesion: boolean;
  cantidadEsperada: number | null; // Del metadata del post
}

export async function recolectarInstagramV2(
  url: string,
  cantidadMaxima: number = 600,
  cookieStr: string = ''
): Promise<Participante[]> {
  let browser: Browser | null = null;
  
  try {
    // === SETUP (igual al actual) ===
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(/* sesión si existe */);
    const page = await context.newPage();
    
    // Aplicar cookies si las hay
    // ... (mismo código que el actual)
    
    // === PREPARAR CONTEXTO ===
    await page.goto(url, { waitUntil: 'networkidle', timeout: 40_000 });
    
    const shortcode = url.match(/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/)?.[1] || '';
    const mediaId = shortcode ? await obtenerMediaId(page, shortcode) : null;
    const autor = await obtenerAutorInstagram(page);
    const cantidadEsperada = await obtenerCantidadComentarios(page);
    
    const ctx: ContextoScraping = {
      page, url, shortcode, mediaId,
      autorExcluido: autor,
      cantidadMaxima,
      tieneSesion: !!cookieStr || haySesionGuardada(),
      cantidadEsperada,
    };
    
    console.log(`Instagram V2: Esperados ~${cantidadEsperada} comentarios, sesión: ${ctx.tieneSesion}`);
    
    // === CASCADA DE ESTRATEGIAS ===
    const estrategias = [
      { nombre: 'GraphQL Interception', fn: estrategiaGraphQL },
      { nombre: 'API REST In-Browser', fn: estrategiaApiRestInBrowser },
      { nombre: 'DOM Scroll Mejorado', fn: estrategiaDomScroll },
      { nombre: 'Servicio Externo', fn: estrategiaServicioExterno },
    ];
    
    let mejorResultado: Participante[] = [];
    
    for (const estrategia of estrategias) {
      try {
        console.log(`Instagram V2: Intentando ${estrategia.nombre}...`);
        const resultado = await estrategia.fn(ctx);
        
        console.log(`Instagram V2: ${estrategia.nombre} → ${resultado.length} participantes`);
        
        // Guardar el mejor resultado
        if (resultado.length > mejorResultado.length) {
          mejorResultado = resultado;
        }
        
        // ¿Cumple el umbral?
        if (cantidadEsperada && resultado.length >= cantidadEsperada * UMBRAL_MINIMO) {
          console.log(`Instagram V2: ${estrategia.nombre} cumple umbral (${resultado.length}/${cantidadEsperada})`);
          return deduplicar(resultado).slice(0, cantidadMaxima);
        }
        
        // Sin cantidad esperada pero tenemos algo razonable
        if (!cantidadEsperada && resultado.length >= 20) {
          return deduplicar(resultado).slice(0, cantidadMaxima);
        }
        
      } catch (e) {
        console.error(`Instagram V2: ${estrategia.nombre} falló:`, (e as Error).message);
      }
    }
    
    // Retornar el mejor resultado que hayamos obtenido
    if (mejorResultado.length > 0) {
      console.log(`Instagram V2: Retornando mejor resultado: ${mejorResultado.length} participantes`);
      return deduplicar(mejorResultado).slice(0, cantidadMaxima);
    }
    
    console.warn('Instagram V2: Ninguna estrategia obtuvo resultados');
    return [];
    
  } finally {
    if (browser) await browser.close();
  }
}

// Obtener la cantidad total de comentarios del metadata del post
async function obtenerCantidadComentarios(page: Page): Promise<number | null> {
  try {
    const html = await page.content();
    
    // Buscar en meta tags / JSON-LD / HTML
    const match = html.match(/"comment_count":(\d+)/) ||
                  html.match(/"edge_media_to_parent_comment":\s*{\s*"count":\s*(\d+)/) ||
                  html.match(/"comments":\s*{\s*"count":\s*(\d+)/);
    
    if (match) {
      const cantidad = parseInt(match[1] || match[2] || '0');
      console.log(`Instagram V2: Cantidad esperada de comentarios: ${cantidad}`);
      return cantidad;
    }
    
    // Fallback: buscar en el DOM (ej: "Ver los 130 comentarios")
    const cantidadDom = await page.evaluate(() => {
      const texto = document.body.textContent || '';
      const match = texto.match(/(?:ver|view)\s+(?:los|all)\s+(\d+)\s+(?:comentarios|comments)/i);
      return match ? parseInt(match[1]) : null;
    });
    
    return cantidadDom;
  } catch {
    return null;
  }
}

function deduplicar(participantes: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of participantes) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) {
      mapa.set(clave, p);
    }
  }
  return Array.from(mapa.values());
}
```

---

### `strategies/graphql-intercept.ts` — Estrategia A

```typescript
import { Participante } from '../types';

// Paths posibles donde Instagram pone los comentarios en el JSON de GraphQL
const COMMENT_PATHS = [
  'data.xdt_shortcode_media.edge_media_to_parent_comment',
  'data.shortcode_media.edge_media_to_parent_comment',
  'data.xdt_media.edge_media_to_parent_comment',
  'data.media.edge_media_to_parent_comment',
];

export async function estrategiaGraphQL(ctx: ContextoScraping): Promise<Participante[]> {
  const { page, autorExcluido, cantidadMaxima } = ctx;
  const buffer: Participante[] = [];
  let paginasRecibidas = 0;
  
  // 1. REGISTRAR LISTENER antes de interactuar
  const promesaDatos = new Promise<void>((resolve) => {
    let ultimoTimestamp = Date.now();
    let checkInterval: NodeJS.Timeout;
    
    page.on('response', async (response) => {
      if (!response.url().includes('/graphql/query')) return;
      
      try {
        const contentType = response.headers()['content-type'] || '';
        if (!contentType.includes('application/json')) return;
        
        const data = await response.json();
        const comentarios = extraerComentariosDeGraphQL(data, autorExcluido);
        
        if (comentarios.length > 0) {
          buffer.push(...comentarios);
          paginasRecibidas++;
          ultimoTimestamp = Date.now();
          console.log(`GraphQL: Página ${paginasRecibidas} → ${comentarios.length} comentarios (total: ${buffer.length})`);
        }
      } catch {
        // Ignorar responses que no son JSON válido
      }
    });
    
    // Resolver cuando no llegan más datos por 5 segundos
    checkInterval = setInterval(() => {
      if (Date.now() - ultimoTimestamp > 5000 && paginasRecibidas > 0) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000);
    
    // Timeout de seguridad
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 60_000);
  });
  
  // 2. ABRIR MODAL y scrollear
  await abrirModalYScrollear(page, cantidadMaxima, buffer);
  
  // 3. Esperar a que el listener termine
  await promesaDatos;
  
  return buffer;
}

async function abrirModalYScrollear(
  page: Page, 
  cantidadMaxima: number,
  buffer: Participante[]
): Promise<void> {
  // Abrir modal de comentarios
  await page.evaluate(() => {
    const candidatos = Array.from(document.querySelectorAll('a, button, span, div'));
    const elemento = candidatos.find((el) => {
      const t = (el.textContent || '').toLowerCase().trim();
      return t.includes('ver todos los comentarios') || 
             t.includes('view all comments') ||
             t.match(/ver los \d+ comentarios/) ||
             t.match(/view all \d+ comments/);
    });
    if (elemento instanceof HTMLElement) elemento.click();
  });
  
  await page.waitForTimeout(3000);
  
  // Loop de scroll + "load more"
  let intentosSinProgreso = 0;
  let cantidadAnterior = 0;
  
  for (let ciclo = 0; ciclo < 100; ciclo++) {
    if (buffer.length >= cantidadMaxima) break;
    
    // Scrollear el modal
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        dialog.scrollBy({ top: 300 + Math.random() * 500, behavior: 'smooth' });
      }
    });
    
    // Clickear "Load more" / "+"
    await page.evaluate(() => {
      const botones = Array.from(document.querySelectorAll('button, a'));
      const loadMore = botones.find(el => {
        const t = (el.textContent || '').trim().toLowerCase();
        return t === '+' || t === 'load more comments' || 
               t === 'ver más comentarios' || t === 'cargar más';
      });
      if (loadMore instanceof HTMLElement) loadMore.click();
    });
    
    // Delay humanizado
    await page.waitForTimeout(1200 + Math.random() * 1800);
    
    // Check progreso
    if (buffer.length === cantidadAnterior) {
      intentosSinProgreso++;
      if (intentosSinProgreso >= 5) break;
    } else {
      intentosSinProgreso = 0;
      cantidadAnterior = buffer.length;
    }
  }
}

function extraerComentariosDeGraphQL(data: any, autorExcluido: string): Participante[] {
  const resultados: Participante[] = [];
  
  for (const path of COMMENT_PATHS) {
    const edgeData = getNestedProperty(data, path);
    if (!edgeData?.edges) continue;
    
    for (const edge of edgeData.edges) {
      const node = edge?.node;
      if (!node) continue;
      
      const usuario = node.owner?.username || node.user?.username || '';
      const comentario = (node.text || '').trim();
      
      if (usuario && usuario.toLowerCase() !== autorExcluido.toLowerCase()) {
        resultados.push({ usuario, comentario });
      }
    }
    
    if (resultados.length > 0) break; // Encontramos el path correcto
  }
  
  return resultados;
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
```

---

### `strategies/api-rest-inbrowser.ts` — Estrategia B

```typescript
const IG_APP_ID = '936619743392459';

export async function estrategiaApiRestInBrowser(ctx: ContextoScraping): Promise<Participante[]> {
  const { page, mediaId, autorExcluido, cantidadMaxima, tieneSesion } = ctx;
  
  // Sin sesión y sin mediaId, esta estrategia no sirve
  if (!mediaId) return [];
  if (!tieneSesion) {
    console.log('API REST In-Browser: Sin sesión, skipping (no mejorará el resultado)');
    return [];
  }
  
  const participantes: Participante[] = [];
  let nextMaxId: string | null = null;
  
  for (let i = 0; i < 100; i++) {
    if (participantes.length >= cantidadMaxima) break;
    
    // === FETCH DENTRO DEL BROWSER ===
    const data = await page.evaluate(async ({ mediaId, maxId, appId }) => {
      const url = `https://www.instagram.com/api/v1/media/${mediaId}/comments/` +
        `?can_support_threading=true&count=200${maxId ? `&max_id=${maxId}` : ''}`;
      
      try {
        const res = await fetch(url, {
          headers: {
            'x-ig-app-id': appId,
            'x-requested-with': 'XMLHttpRequest',
          },
          credentials: 'include',
        });
        
        if (!res.ok) return { error: `HTTP ${res.status}` };
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('json')) return { error: 'No JSON' };
        return await res.json();
      } catch (e: any) {
        return { error: e.message };
      }
    }, { mediaId, maxId: nextMaxId, appId: IG_APP_ID });
    
    if (data?.error) {
      console.log(`API REST In-Browser: Error ${data.error}`);
      break;
    }
    
    const comentarios = data.comments || [];
    for (const c of comentarios) {
      const usuario = c?.user?.username;
      const comentario = (c?.text || '').trim();
      if (usuario && usuario.toLowerCase() !== autorExcluido.toLowerCase()) {
        participantes.push({ usuario, comentario });
      }
    }
    
    nextMaxId = data.next_max_id || null;
    console.log(`API REST In-Browser: Iteración ${i + 1} → ${comentarios.length} comentarios, total ${participantes.length}`);
    
    if (!nextMaxId) break;
    
    // Delay entre requests para no triggear rate limit
    await page.waitForTimeout(500 + Math.random() * 1000);
  }
  
  return participantes;
}
```

---

### `strategies/dom-scroll.ts` — Estrategia C

```typescript
export async function estrategiaDomScroll(ctx: ContextoScraping): Promise<Participante[]> {
  const { page, autorExcluido, cantidadMaxima } = ctx;
  
  // Reutilizar la lógica del instagram.ts actual pero mejorada
  // con scroll humanizado y MutationObserver
  
  // 1. Abrir modal (si no está abierto ya)
  await abrirModal(page);
  
  // 2. Instalar MutationObserver
  await page.evaluate(() => {
    (window as any).__igCommentNodes = [];
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (node instanceof HTMLElement) {
            (window as any).__igCommentNodes.push(node.outerHTML);
          }
        }
      }
    });
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) observer.observe(dialog, { childList: true, subtree: true });
  });
  
  // 3. Loop de scroll humanizado
  let participantes: Participante[] = [];
  let sinProgreso = 0;
  
  for (let ciclo = 0; ciclo < 100; ciclo++) {
    if (participantes.length >= cantidadMaxima) break;
    
    // Scroll suave con velocidad variable
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const amount = 200 + Math.random() * 600;
        dialog.scrollBy({ top: amount, behavior: 'smooth' });
      }
    });
    
    // Click "Load more" si existe
    await page.evaluate(() => {
      const botones = Array.from(document.querySelectorAll('button'));
      const btn = botones.find(b => {
        const t = (b.textContent || '').trim();
        return t === '+' || t.toLowerCase().includes('load more');
      });
      if (btn) btn.click();
    });
    
    // Delay humanizado
    await page.waitForTimeout(1000 + Math.random() * 2000);
    
    // Extraer pares del DOM actual
    const nuevos = await extraerParesDOM(page, autorExcluido);
    
    if (nuevos.length <= participantes.length) {
      sinProgreso++;
      if (sinProgreso >= 5) break;
    } else {
      sinProgreso = 0;
      participantes = nuevos;
      console.log(`DOM Scroll: ${participantes.length} participantes`);
    }
  }
  
  return participantes;
}
```

---

### `parsers/instagram-paste.ts` — Parser Manual (Estrategia E)

```typescript
import { Participante } from '../types';

const TIMESTAMP_REGEX = /^\d+\s*(sem|min|h|d|w|mo|yr|año|día|hora|mes|semana|segundo)s?$/i;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;
const UI_TEXTOS = [
  'foto del perfil', 'profile picture', 'reply', 'responder', 
  'like', 'liked', 'me gusta', 'ver respuestas', 'view replies', 
  'traducir', 'translate', 'editado', 'edited', 'denunciar', 'report',
  'ver más', 'view more', 'ocultar', 'hide',
];

export function parsearTextoInstagramPegado(texto: string): Participante[] {
  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  const participantes: Participante[] = [];
  const vistos = new Set<string>();
  
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    
    // ¿Es un username válido?
    if (USERNAME_REGEX.test(linea) && !TIMESTAMP_REGEX.test(linea) && !esTextoUI(linea)) {
      const usuario = linea;
      let comentario = '';
      
      // Buscar el comentario en las siguientes líneas
      for (let j = i + 1; j < Math.min(i + 6, lineas.length); j++) {
        const sig = lineas[j];
        
        // ¿Es timestamp? → skip
        if (TIMESTAMP_REGEX.test(sig)) continue;
        
        // ¿Es texto de UI? → skip
        if (esTextoUI(sig)) continue;
        
        // ¿Es otro username? → este usuario no tiene comentario visible, parar
        if (USERNAME_REGEX.test(sig) && !sig.startsWith('@')) break;
        
        // Este es el comentario (puede empezar con @menciones)
        comentario = sig.slice(0, 500);
        break;
      }
      
      if (comentario || true) { // Incluir usuarios aunque no tengan comentario visible
        const clave = `${usuario}|${comentario}`;
        if (!vistos.has(clave)) {
          vistos.add(clave);
          participantes.push({ usuario, comentario: comentario || '(sin texto visible)' });
        }
      }
    }
    
    i++;
  }
  
  return participantes;
}

function esTextoUI(texto: string): boolean {
  const t = texto.toLowerCase();
  return UI_TEXTOS.some(ui => t.includes(ui));
}
```

---

## Logs Relacionados

Al implementar esta mejora, se generarán los siguientes logs:

- `Logs/NN-MEJORA_SCRAPER_INSTAGRAM_V2_YYYY-MM-DD_HH-MM-SS.md`

Con el siguiente contenido obligatorio:
1. Código original relevante (funciones modificadas de `index.ts`)
2. Código nuevo (archivos creados)
3. Resultados de tests (cantidad de comentarios capturados antes vs después)
