**Modelo:** DeepSeek
**Fecha:** 2026-08-02 03:05:00
**Responde a:** `2026-08-02_02-18-45_4-DEEPSEEK-recoleccion-todos-comentarios.md`

# Diagnóstico de la publicación real del usuario + Login Asistido de Instagram

## Problema reportado por el usuario
Su publicación real (`https://www.instagram.com/p/C347268uDMm/?img_index=1`, marca **bazardigital.hinata**) seguía devolviendo **solo ~15 comentarios**, aunque él ve **muchos más (~200)** al estar logueado. Además, en Instagram **no se pueden seleccionar/copiar los comentarios**, así que el modo manual tampoco sirve para esa cantidad.

## Diagnóstico (scripts temporales, ya eliminados)
1. **`diag-user.tmp.ts`**: RESULTADO FINAL = **15 participantes**. Autor `bazardigital.hinata` detectado y excluido correctamente vía og:url. API interna: www → 302, i.instagram.com OK pero 0 comentarios → exige sesión.
2. **`diag-dom.tmp.ts`**: 112 links totales, 19 de perfil con texto: `bazardigital.hinata` (header), `karen_etcheverry`, `mirmili2021`, `cataldovanesa`, `pia_mugetti` (×10), `bazardigital.hinata`, `Popular`.
3. **Conclusión**: los 15 pares extraídos son **CORRECTOS** (coinciden 1:1 con la lista que ve el usuario). El límite de 15 lo impone **Instagram sin sesión**, no el scraper. Los ~200 solo están disponibles logueado.

## Solución: Login Asistido (1 clic, sin F12)
- **`api/src/routes/instagram.ts`** (nuevo): `POST /instagram/login` → `chromium.launch({ headless: false })` abre una **ventana visible de Chrome**, espera hasta 5 min a que el usuario se loguee (la URL deja de ser `/accounts/...`), detecta el @usuario, guarda `.instagram-session.json` (storageState con cookies HttpOnly: sessionid) + `.instagram-session-info.json`, cierra el navegador. `POST /instagram/logout` y `GET /instagram/estado`.
- **Collector**: si no hay `cookieStr` y existe la sesión guardada → `newContext({ storageState })` → TODOS los comentarios vía API paginada en todos los análisis siguientes.
- **`/analizar`**: respuesta con `sesion: 'anonima' | 'cookies' | 'guardada' | 'manual'`.
- **Wizard**: panel ámbar con botón **"Conectar mi cuenta"** (y colapsable "O pegá tus cookies manualmente (opción avanzada)"); si hay sesión → badge verde "@usuario" + "Desconectar". Preview con badge según el modo.
- **`.gitignore`**: protege los archivos de sesión (nunca subir credenciales).

## Verificación
- `tsc --noEmit` api/web OK; build frontend OK (7 páginas); `GET /instagram/estado` → `{ conectado: false }`; `/analizar` (publicación del usuario) → 15 + `sesion: 'anonima'` (correcto sin sesión); servidores 4000/3000 reiniciados, frontend 200.

## Pendiente para el usuario
1. Recargar la web (Ctrl+F5).
2. Pegar la URL de su publicación → presionar **"Conectar mi cuenta"** → se abre una ventana de Chrome → loguearse (o escanear el QR).
3. Esperar a que la ventana se cierre sola (aparece badge verde "@usuario").
4. "Analizar publicación" → debería recolectar **TODOS los comentarios (~200)** con sesión guardada.
