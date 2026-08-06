// Combina las cookies pegadas por el usuario con el sessionId de Instagram.
// El sessionid es la única cookie necesaria para las requests autenticadas de
// lectura (GraphQL) de Instagram; si el usuario pega la cookie completa
// (ig_did=...; sessionid=...; ...) se respeta tal cual.
export function construirCookiesCompletas(cookies?: unknown, sessionId?: unknown): string {
  const partes = (typeof cookies === 'string' ? cookies : '')
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean);

  const sid = typeof sessionId === 'string' ? sessionId.trim() : '';
  if (sid) {
    const valor = /^sessionid\s*=/i.test(sid) ? sid : `sessionid=${sid}`;
    if (!partes.some((c) => /^sessionid\s*=/i.test(c))) {
      partes.push(valor);
    }
  }

  return partes.join('; ');
}
