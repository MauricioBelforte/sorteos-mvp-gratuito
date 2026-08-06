# 03 - Diseño: Captura Completa de Comentarios de Instagram

## Arquitectura Propuesta

### Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                     recolectarInstagram()                        │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │Estrategia│    │Estrategia│    │Estrategia│    │Estrategia│   │
│  │    A     │───▶│    B     │───▶│    C     │───▶│    D     │   │
│  │ GraphQL  │    │ API REST │    │   DOM    │    │ Externo  │   │
│  │Intercept │    │in-browser│    │ Scroll+  │    │ (Apify)  │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│       │                │                │               │        │
│       └────────────────┴────────────────┴───────────────┘        │
│                              │                                   │
│                    Participante[]                                 │
│                    { usuario, comentario }                        │
└──────────────────────────────────────────────────────────────────┘
                               │
                    Si todo falla (< umbral)
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│              Estrategia E: Manual Mejorado (Frontend)            │
│  UI con textarea inteligente + parser de formato Instagram       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Diseño Detallado: Estrategia A — Intercepción de GraphQL

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SETUP                                                         │
│    browser = chromium.launch({ headless: true })                 │
│    page = context.newPage()                                      │
│                                                                  │
│ 2. REGISTRAR LISTENER (antes de navegar)                         │
│    commentsBuffer: Participante[] = []                           │
│    page.on('response', async (res) => {                          │
│      if (res.url().includes('/graphql/query')) {                  │
│        const json = await res.json()                             │
│        // Buscar edge_media_to_parent_comment                    │
│        // Buscar xdt_shortcode_media.edge_media_to_parent_comment│
│        // Extraer: node.owner.username + node.text               │
│        commentsBuffer.push(...)                                  │
│      }                                                           │
│    })                                                            │
│                                                                  │
│ 3. NAVEGAR                                                       │
│    page.goto(url, { waitUntil: 'networkidle' })                  │
│                                                                  │
│ 4. ABRIR MODAL DE COMENTARIOS                                   │
│    click "Ver todos los comentarios"                             │
│                                                                  │
│ 5. LOOP DE CARGA                                                 │
│    while (hayMasComentarios && intentos < MAX_INTENTOS) {        │
│      - Scrollear el modal hacia abajo                            │
│      - Buscar y clickear botón "+" o "Load more comments"        │
│      - Esperar delay aleatorio (1-3 segundos)                    │
│      - El listener captura las responses automáticamente         │
│      - Si 3 intentos sin nuevos datos → break                   │
│    }                                                             │
│                                                                  │
│ 6. RETORNAR                                                      │
│    return deduplicate(commentsBuffer)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura esperada del JSON de GraphQL

Instagram envía los comentarios en respuestas GraphQL con esta estructura (puede variar):

```json
{
  "data": {
    "xdt_shortcode_media": {
      "edge_media_to_parent_comment": {
        "count": 130,
        "page_info": {
          "has_next_page": true,
          "end_cursor": "QVFBdG9..."
        },
        "edges": [
          {
            "node": {
              "id": "17864...",
              "text": "@ailin_1453 @kevin_1495xd",
              "created_at": 1709312400,
              "owner": {
                "id": "1234567",
                "username": "karen_etcheverry",
                "profile_pic_url": "..."
              }
            }
          }
        ]
      }
    }
  }
}
```

### Paths alternativos a buscar en la respuesta GraphQL

Instagram cambia la estructura periódicamente. El extractor debe buscar en MÚLTIPLES paths:

```typescript
const COMMENT_PATHS = [
  // Formato moderno (2025-2026)
  'data.xdt_shortcode_media.edge_media_to_parent_comment',
  // Formato clásico
  'data.shortcode_media.edge_media_to_parent_comment',  
  // Formato media
  'data.xdt_media.edge_media_to_parent_comment',
  // Formato directo
  'data.media.edge_media_to_parent_comment',
];
```

### Extracción robusta de comentarios

```typescript
function extraerComentariosDeGraphQL(data: any): { usuario: string; comentario: string }[] {
  const resultados: { usuario: string; comentario: string }[] = [];
  
  for (const path of COMMENT_PATHS) {
    const edgeData = getNestedProperty(data, path);
    if (!edgeData?.edges) continue;
    
    for (const edge of edgeData.edges) {
      const node = edge.node;
      if (!node) continue;
      
      const usuario = node.owner?.username || node.user?.username || '';
      const comentario = (node.text || '').trim();
      
      if (usuario && esUsernameValido(usuario)) {
        resultados.push({ usuario, comentario });
      }
    }
  }
  
  return resultados;
}
```

---

## Diseño Detallado: Estrategia B — API REST In-Browser

### Cambio clave vs. el código actual

**ANTES (actual):** `fetchApiDesdeNode()` — hace fetch desde Node.js
```typescript
// ❌ ACTUAL: fetch desde Node.js (TLS fingerprint de Node, no de browser)
const res = await fetch(url, { headers: { Cookie: cookieStr, ... } });
```

**DESPUÉS (propuesto):** `page.evaluate(() => fetch(...))` — hace fetch dentro del browser
```typescript
// ✅ PROPUESTO: fetch dentro del contexto del browser (TLS fingerprint real)
const data = await page.evaluate(async ({ mediaId, maxId, appId }) => {
  const url = `https://www.instagram.com/api/v1/media/${mediaId}/comments/` +
    `?can_support_threading=true&count=200${maxId ? `&max_id=${maxId}` : ''}`;
  
  const res = await fetch(url, {
    headers: {
      'x-ig-app-id': appId,
      'x-requested-with': 'XMLHttpRequest',
    },
    credentials: 'include', // ← Esto envía las cookies automáticamente
  });
  
  if (!res.ok) return { error: `HTTP ${res.status}` };
  return res.json();
}, { mediaId, maxId: nextMaxId, appId: IG_APP_ID });
```

### Ventaja de este enfoque
- La request sale con el **TLS fingerprint del Chromium** real.
- Las cookies se envían automáticamente con `credentials: 'include'`.
- Instagram no puede distinguir esto de un usuario navegando.

### Manejo de CSP (Content Security Policy)
Si Instagram bloquea el fetch por CSP, usar `page.route()` para interceptar:

```typescript
// Interceptar y reescribir las respuestas CSP
await page.route('**/*', (route) => {
  const headers = route.request().headers();
  // Eliminar headers CSP restrictivos
  route.continue();
});
```

---

## Diseño Detallado: Estrategia C — DOM Scroll Mejorado

### Mejoras sobre el código actual

1. **Scroll suave con velocidad variable** (simular humano):
```typescript
async function scrollHumano(page: Page, container: string) {
  const scrollAmount = 300 + Math.random() * 400; // 300-700px
  await page.evaluate((args) => {
    const el = document.querySelector(args.container) || window;
    el.scrollBy({ top: args.amount, behavior: 'smooth' });
  }, { container, amount: scrollAmount });
  
  // Delay aleatorio entre 800ms y 2500ms
  await page.waitForTimeout(800 + Math.random() * 1700);
}
```

2. **MutationObserver para detectar nuevos comentarios**:
```typescript
// Instalar un observer que cuenta nodos nuevos
await page.evaluate(() => {
  window.__newCommentCount = 0;
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      window.__newCommentCount += m.addedNodes.length;
    }
  });
  const dialog = document.querySelector('[role="dialog"]');
  if (dialog) observer.observe(dialog, { childList: true, subtree: true });
});
```

3. **Extracción de pares más robusta** usando `aria-label` y `data-testid`:
```typescript
// Buscar comentarios por estructura semántica, no por clases CSS
const comentarios = document.querySelectorAll('[role="dialog"] ul > div > li');
```

---

## Diseño Detallado: Estrategia D — Servicio Externo

### Integración con Apify (ejemplo)

```typescript
async function capturarViaApify(postUrl: string): Promise<Participante[]> {
  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  if (!APIFY_TOKEN) return []; // No configurado
  
  const response = await fetch(
    'https://api.apify.com/v2/acts/apify~instagram-comment-scraper/runs',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_TOKEN}`,
      },
      body: JSON.stringify({
        directUrls: [postUrl],
        resultsLimit: 1000,
      }),
    }
  );
  
  // Polling hasta que termine
  // ... parsear resultados a Participante[]
}
```

### Variable de entorno nueva
```env
APIFY_TOKEN=apify_api_XXXXXXXX  # Opcional, solo si se quiere usar el servicio externo
```

---

## Diseño Detallado: Estrategia E — Manual Mejorado

### Parser inteligente de texto pegado

El usuario pega texto crudo desde Instagram con este formato típico:

```
karen_etcheverry\n125 sem\n@ailin_1453 @kevin_1495xd\nFoto del perfil de karen_etcheverry\n
```

El parser debe:
1. Detectar usernames (líneas que coinciden con `^[a-zA-Z0-9_.]{3,30}$`).
2. Ignorar líneas de UI ("Foto del perfil de...", "125 sem", "reply", etc.).
3. Asociar cada username con su comentario (la línea siguiente que NO sea timestamp ni UI).

```typescript
function parsearTextoInstagramPegado(texto: string): Participante[] {
  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  const participantes: Participante[] = [];
  const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
  const timestampRegex = /^\d+\s*(sem|min|h|d|w|mo|yr|año|día|hora|mes)$/i;
  const uiTextos = ['foto del perfil', 'reply', 'responder', 'like', 'me gusta', 
                     'ver respuestas', 'view replies', 'traducir', 'translate'];
  
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    
    // ¿Es un username?
    if (usernameRegex.test(linea) && !timestampRegex.test(linea)) {
      const usuario = linea;
      let comentario = '';
      
      // Buscar el comentario en las líneas siguientes
      for (let j = i + 1; j < Math.min(i + 5, lineas.length); j++) {
        const siguiente = lineas[j];
        // Ignorar timestamps y UI
        if (timestampRegex.test(siguiente)) continue;
        if (uiTextos.some(t => siguiente.toLowerCase().includes(t))) continue;
        if (usernameRegex.test(siguiente)) break; // Siguiente usuario
        
        // Este es el comentario
        comentario = siguiente;
        break;
      }
      
      if (comentario) {
        participantes.push({ usuario, comentario });
      }
    }
    i++;
  }
  
  return deduplicate(participantes);
}
```

### Componente Frontend (React/Next.js)

```tsx
// Componente de pegado manual mejorado
function PegadoManualInstagram({ onParticipantes }) {
  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState([]);
  
  const handlePegar = (e) => {
    const texto = e.target.value;
    setTexto(texto);
    const participantes = parsearTextoInstagramPegado(texto);
    setPreview(participantes);
  };
  
  return (
    <div>
      <h3>Pegar comentarios manualmente</h3>
      <p>Seleccioná todos los comentarios en Instagram y pegalos acá:</p>
      <textarea 
        value={texto}
        onChange={handlePegar}
        rows={10}
        placeholder="Pegá los comentarios copiados de Instagram..."
      />
      {preview.length > 0 && (
        <div>
          <h4>Preview: {preview.length} participantes detectados</h4>
          <ul>
            {preview.map((p, i) => (
              <li key={i}>@{p.usuario}: {p.comentario}</li>
            ))}
          </ul>
          <button onClick={() => onParticipantes(preview)}>
            Usar estos {preview.length} participantes
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Estructura de Archivos Propuesta

```
api/src/collectors/
├── instagram.ts              ← Archivo actual (MANTENER como respaldo)
├── instagram-v2.ts           ← NUEVO: Recolector con cascada de estrategias
├── strategies/               ← NUEVO: Cada estrategia en su archivo
│   ├── graphql-intercept.ts  ← Estrategia A
│   ├── api-rest-inbrowser.ts ← Estrategia B
│   ├── dom-scroll.ts         ← Estrategia C (mejora del actual)
│   ├── external-service.ts   ← Estrategia D
│   └── types.ts              ← Tipos compartidos
├── parsers/
│   └── instagram-paste.ts    ← Parser para Estrategia E (usado en frontend)
├── index.ts                  ← Modificar para usar instagram-v2
├── tiktok.ts
├── youtube.ts
└── types.ts
```

### Principio de diseño: NO tocar lo que funciona

Según la regla 15 del AGENTS.md (**Modularización de Flujos Complejos**):
- El archivo `instagram.ts` actual **NO se modifica**.
- Se crea un **nuevo archivo** `instagram-v2.ts` con la cascada de estrategias.
- El nuevo archivo puede **reutilizar funciones auxiliares** del actual (`esUsernameValido`, `obtenerAutorInstagram`, etc.).
- El `index.ts` se modifica para apuntar a `instagram-v2.ts`.
- Si algo falla, se puede volver al `instagram.ts` original sin riesgos.
