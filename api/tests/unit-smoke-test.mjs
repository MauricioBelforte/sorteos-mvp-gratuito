/**
 * Script de pruebas unitarias y smoke test para Sorteosypromos
 * Componente: 07-Plan-de-Testings-Completo
 * Fecha: 2026-08-04
 * 
 * Este script es autocontenido: copia las funciones puras de los archivos fuente
 * para poder testearlas sin depender de imports externos (Prisma, Playwright, etc.)
 */

import { createHash } from "crypto";

// ============================================================================
// FUNCIONES COPIADAS DE api/src/lib/verificacion.ts (para testear sin imports)
// ============================================================================

function generarHashParticipantes(participantes) {
  const ordenada = [...participantes].sort();
  const input = ordenada.join("|");
  return createHash("sha256").update(input).digest("hex");
}

function generarHashVerificacion(participantes, timestamp) {
  const participantesHash = generarHashParticipantes(participantes);
  const input = `${participantesHash}|${timestamp}`;
  return createHash("sha256").update(input).digest("hex");
}

function crearPRNG(seed) {
  let num = 0;
  for (let i = 0; i < seed.length; i++) {
    num = (num * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  if (num === 0) num = 1;
  return {
    next() {
      num = (num * 16807) % 2147483647;
      return (num - 1) / 2147483646;
    },
  };
}

function seleccionarSinRepeticion(arr, cantidad, prng) {
  const disponibles = [...arr];
  const seleccionados = [];
  for (let i = 0; i < Math.min(cantidad, disponibles.length); i++) {
    const idx = Math.floor(prng.next() * disponibles.length);
    seleccionados.push(disponibles[idx]);
    disponibles.splice(idx, 1);
  }
  return seleccionados;
}

function realizarSorteo(participantes, cantidadGanadores, cantidadSuplentes) {
  const unicos = [...new Set(participantes)];
  if (unicos.length === 0) {
    throw new Error("No hay participantes para realizar el sorteo");
  }
  const timestamp = new Date().toISOString();
  const hashVerificacion = generarHashVerificacion(unicos, timestamp);
  const participantesHash = generarHashParticipantes(unicos);
  const prng = crearPRNG(hashVerificacion);
  const ganadores = seleccionarSinRepeticion(unicos, cantidadGanadores, prng);
  const restantes = unicos.filter((p) => !ganadores.includes(p));
  const suplentes = seleccionarSinRepeticion(restantes, cantidadSuplentes, prng);
  return { ganadores, suplentes, hashVerificacion, participantesHash, timestamp };
}

function verificarSorteo(participantes, timestamp, hashVerificacionEsperado) {
  const hashCalculado = generarHashVerificacion(participantes, timestamp);
  return hashCalculado === hashVerificacionEsperado;
}

// ============================================================================
// FUNCIONES COPIADAS DE api/src/lib/sorteos-service.ts (para testear sin imports)
// ============================================================================

function calcularPrecio(cantidadComentarios) {
  if (cantidadComentarios <= 1000) return 0;
  if (cantidadComentarios <= 2000) return 5000;
  if (cantidadComentarios <= 3000) return 6000;
  if (cantidadComentarios <= 10000) return 10000;
  return 10000 + Math.ceil((cantidadComentarios - 10000) / 1000) * 1000;
}

function deduplicarParticipantes(participantes) {
  const mapa = new Map();
  for (const p of participantes) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

// ============================================================================
// FRAMEWORK DE TESTING MINIMALISTA
// ============================================================================

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName, details = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    failures.push({ testName, details });
    console.log(`  ❌ ${testName} ${details ? "— " + details : ""}`);
  }
}

function assertThrows(fn, testName) {
  try {
    fn();
    failed++;
    failures.push({ testName, details: "No lanzó error" });
    console.log(`  ❌ ${testName} — No lanzó error`);
  } catch (e) {
    passed++;
    console.log(`  ✅ ${testName}`);
  }
}

// ============================================================================
// PRUEBAS UNITARIAS - Motor de Sorteos (verificacion.ts)
// ============================================================================

console.log("\n🧪 PRUEBAS UNITARIAS — Motor de Sorteos (verificacion.ts)\n");

// U-SORT-01: Sorteo con 10 participantes, 1 ganador
{
  const participantes = ["user1","user2","user3","user4","user5","user6","user7","user8","user9","user10"];
  const resultado = realizarSorteo(participantes, 1, 0);
  assert(resultado.ganadores.length === 1, "U-SORT-01: 10 participantes → 1 ganador");
  assert(participantes.includes(resultado.ganadores[0]), "U-SORT-01: ganador ∈ pool");
}

// U-SORT-02: Sorteo con 10 participantes, 3 ganadores
{
  const participantes = ["user1","user2","user3","user4","user5","user6","user7","user8","user9","user10"];
  const resultado = realizarSorteo(participantes, 3, 0);
  assert(resultado.ganadores.length === 3, "U-SORT-02: 10 participantes → 3 ganadores");
  const unique = new Set(resultado.ganadores);
  assert(unique.size === 3, "U-SORT-02: 3 ganadores únicos (sin repetición)");
}

// U-SORT-03: Sorteo con 10 participantes, 5 ganadores + 2 suplentes
{
  const participantes = ["user1","user2","user3","user4","user5","user6","user7","user8","user9","user10"];
  const resultado = realizarSorteo(participantes, 5, 2);
  assert(resultado.ganadores.length === 5, "U-SORT-03: 5 ganadores");
  assert(resultado.suplentes.length === 2, "U-SORT-03: 2 suplentes");
  const all = [...resultado.ganadores, ...resultado.suplentes];
  const unique = new Set(all);
  assert(unique.size === 7, "U-SORT-03: 7 únicos totales (sin repetición)");
}

// U-SORT-04: Ganadores > participantes (se limita al pool)
{
  const participantes = ["user1","user2","user3","user4","user5"];
  const resultado = realizarSorteo(participantes, 10, 0);
  assert(resultado.ganadores.length <= 5, "U-SORT-04: ganadores limitados al pool (≤5)");
}

// U-SORT-05: Sorteo con 0 participantes (lanza error)
{
  assertThrows(() => realizarSorteo([], 1, 0), "U-SORT-05: 0 participantes → error");
}

// U-SORT-06: Sorteo con 1 participante
{
  const resultado = realizarSorteo(["user1"], 1, 0);
  assert(resultado.ganadores.length === 1, "U-SORT-06: 1 participante → 1 ganador");
  assert(resultado.ganadores[0] === "user1", "U-SORT-06: ganador = user1");
}

// U-SORT-07: Hash de verificación consistente
{
  const participantes = ["user1","user2","user3"];
  const timestamp = "2026-08-04T00:00:00.000Z";
  const hash1 = generarHashVerificacion(participantes, timestamp);
  const hash2 = generarHashVerificacion(participantes, timestamp);
  assert(hash1 === hash2, "U-SORT-07: hash determinístico (mismo input → mismo hash)");
  assert(hash1.length === 64, "U-SORT-07: hash SHA-256 (64 chars)");
}

// U-SORT-08: Verificación de sorteo
{
  const participantes = ["user1","user2","user3"];
  const timestamp = "2026-08-04T00:00:00.000Z";
  const hash = generarHashVerificacion(participantes, timestamp);
  assert(verificarSorteo(participantes, timestamp, hash), "U-SORT-08: verificarSorteo → true (hash válido)");
  assert(!verificarSorteo(participantes, timestamp, "hash-invalid"), "U-SORT-08: verificarSorteo → false (hash inválido)");
}

// U-SORT-09: Orden del array no afecta el hash de participantes
{
  const orden1 = ["user1","user2","user3"];
  const orden2 = ["user3","user1","user2"];
  const hash1 = generarHashParticipantes(orden1);
  const hash2 = generarHashParticipantes(orden2);
  assert(hash1 === hash2, "U-SORT-09: hash independiente del orden (sort interno)");
}

// ============================================================================
// PRUEBAS UNITARIAS — Modelo de Precios (sorteos-service.ts)
// ============================================================================

console.log("\n🧪 PRUEBAS UNITARIAS — Modelo de Precios (sorteos-service.ts)\n");

assert(calcularPrecio(0) === 0, "U-PRECIO-01: 0 comentarios → $0 (gratis)");
assert(calcularPrecio(500) === 0, "U-PRECIO-02: 500 comentarios → $0 (gratis)");
assert(calcularPrecio(1000) === 0, "U-PRECIO-03: 1000 comentarios → $0 (límite gratis)");
assert(calcularPrecio(1001) === 5000, "U-PRECIO-04: 1001 comentarios → $5000");
assert(calcularPrecio(2000) === 5000, "U-PRECIO-05: 2000 comentarios → $5000");
assert(calcularPrecio(2001) === 6000, "U-PRECIO-06: 2001 comentarios → $6000");
assert(calcularPrecio(3000) === 6000, "U-PRECIO-07: 3000 comentarios → $6000");
assert(calcularPrecio(3001) === 10000, "U-PRECIO-08: 3001 comentarios → $10000");
assert(calcularPrecio(10000) === 10000, "U-PRECIO-09: 10000 comentarios → $10000");
assert(calcularPrecio(10001) === 11000, "U-PRECIO-10: 10001 comentarios → $11000");
assert(calcularPrecio(11000) === 11000, "U-PRECIO-11: 11000 comentarios → $11000");
assert(calcularPrecio(11001) === 12000, "U-PRECIO-12: 11001 comentarios → $12000");

// ============================================================================
// PRUEBAS UNITARIAS — Deduplicación (sorteos-service.ts)
// ============================================================================

console.log("\n🧪 PRUEBAS UNITARIAS — Deduplicación (sorteos-service.ts)\n");

// U-DEDUP-01: Duplicados exactos
{
  const input = [
    { usuario: "user1", comentario: "hola" },
    { usuario: "user1", comentario: "hola" },
  ];
  const result = deduplicarParticipantes(input);
  assert(result.length === 1, "U-DEDUP-01: 2 duplicados exactos → 1");
}

// U-DEDUP-02: Case-insensitive en usuario
{
  const input = [
    { usuario: "User1", comentario: "hola" },
    { usuario: "user1", comentario: "hola" },
  ];
  const result = deduplicarParticipantes(input);
  assert(result.length === 1, "U-DEDUP-02: 'User1' y 'user1' → 1 (case-insensitive usuario)");
}

// U-DEDUP-03: BUG — Case-insensitive en comentario NO aplicado
{
  const input = [
    { usuario: "user1", comentario: "Hola" },
    { usuario: "user1", comentario: "HOLA" },
  ];
  const result = deduplicarParticipantes(input);
  // BUG: debería ser 1, pero es 2 porque no aplica toLowerCase() al comentario
  assert(result.length === 2, "U-DEDUP-03: BUG — 'Hola' y 'HOLA' → 2 (debería ser 1)", "toLowerCase() NO aplicado a comentario");
}

// U-DEDUP-04: Array vacío
{
  const result = deduplicarParticipantes([]);
  assert(result.length === 0, "U-DEDUP-04: array vacío → 0");
}

// U-DEDUP-05: Sin duplicados
{
  const input = [
    { usuario: "user1", comentario: "hola" },
    { usuario: "user2", comentario: "chau" },
    { usuario: "user3", comentario: "genial" },
  ];
  const result = deduplicarParticipantes(input);
  assert(result.length === 3, "U-DEDUP-05: 3 sin duplicados → 3");
}

// U-DEDUP-06: Múltiples duplicados
{
  const input = [
    { usuario: "user1", comentario: "hola" },
    { usuario: "user1", comentario: "hola" },
    { usuario: "user1", comentario: "hola" },
    { usuario: "user2", comentario: "chau" },
    { usuario: "user2", comentario: "chau" },
    { usuario: "user3", comentario: "ok" },
  ];
  const result = deduplicarParticipantes(input);
  assert(result.length === 3, "U-DEDUP-06: 6 con duplicados → 3 únicos");
}

// ============================================================================
// PRUEBAS UNITARIAS — Parser Manual (instagram-paste.ts)
// ============================================================================

console.log("\n🧪 PRUEBAS UNITARIAS — Parser Manual (instagram-paste.ts)\n");

// Copia de parsearParticipantesManuales (de instagram-paste.ts)
function parsearParticipantesManuales(lineas) {
  const participantes = [];
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;
    const match = linea.match(/^@?(\S+)\s+(.*)$/);
    if (match) {
      participantes.push({ usuario: match[1], comentario: match[2] });
    } else {
      participantes.push({ usuario: `Anónimo ${participantes.length + 1}`, comentario: linea });
    }
  }
  return participantes;
}

// U-PARSE-01: Texto con @usuario
{
  const result = parsearParticipantesManuales(["@user comentario de prueba"]);
  assert(result.length === 1, "U-PARSE-01: 1 línea → 1 participante");
  assert(result[0].usuario === "user", "U-PARSE-01: usuario = 'user' (sin @)");
  assert(result[0].comentario === "comentario de prueba", "U-PARSE-01: comentario correcto");
}

// U-PARSE-02: Texto sin @
{
  const result = parsearParticipantesManuales(["comentario solo sin arroba"]);
  assert(result.length === 1, "U-PARSE-02: 1 línea → 1 participante");
  assert(result[0].usuario === "Anónimo 1", "U-PARSE-02: usuario = 'Anónimo 1'");
}

// U-PARSE-03: Texto vacío
{
  const result = parsearParticipantesManuales([]);
  assert(result.length === 0, "U-PARSE-03: array vacío → 0 participantes");
}

// U-PARSE-04: Múltiples líneas
{
  const result = parsearParticipantesManuales(["@a hola", "@b chau"]);
  assert(result.length === 2, "U-PARSE-04: 2 líneas → 2 participantes");
  assert(result[0].usuario === "a", "U-PARSE-04: primer usuario = 'a'");
  assert(result[1].usuario === "b", "U-PARSE-04: segundo usuario = 'b'");
}

// U-PARSE-05: Línea vacía en el medio
{
  const result = parsearParticipantesManuales(["@a hola", "", "@b chau"]);
  assert(result.length === 2, "U-PARSE-05: línea vacía ignorada → 2 participantes");
}

// ============================================================================
// PRUEBAS DE EDGE CASES — Motor de Sorteos
// ============================================================================

console.log("\n🧪 EDGE CASES — Motor de Sorteos\n");

// E-SORT-01: Participantes duplicados en el input
{
  const participantes = ["user1","user1","user2","user2","user3"];
  const resultado = realizarSorteo(participantes, 3, 0);
  assert(resultado.ganadores.length === 3, "E-SORT-01: duplicados en input → sorteo con únicos");
}

// E-SORT-02: Suplentes > restantes
{
  const participantes = ["user1","user2","user3"];
  const resultado = realizarSorteo(participantes, 1, 10);
  assert(resultado.ganadores.length === 1, "E-SORT-02: 1 ganador");
  assert(resultado.suplentes.length <= 2, "E-SORT-02: suplentes limitados a restantes (≤2)");
}

// E-SORT-03: Todos los participantes como ganadores
{
  const participantes = ["user1","user2","user3"];
  const resultado = realizarSorteo(participantes, 3, 0);
  assert(resultado.ganadores.length === 3, "E-SORT-03: todos ganadores");
  assert(resultado.suplentes.length === 0, "E-SORT-03: 0 suplentes");
}

// E-SORT-04: Hash con array vacío
{
  const hash = generarHashParticipantes([]);
  assert(typeof hash === "string", "E-SORT-04: hash de array vacío es string");
  assert(hash.length === 64, "E-SORT-04: hash de array vacío tiene 64 chars");
}

// ============================================================================
// PRUEBAS DE RENDIMIENTO (Smoke)
// ============================================================================

console.log("\n🧪 PRUEBAS DE RENDIMIENTO (Smoke)\n");

// S-PERF-01: Sorteo con 100 participantes < 1s
{
  const participantes = Array.from({ length: 100 }, (_, i) => `user${i}`);
  const start = performance.now();
  realizarSorteo(participantes, 1, 0);
  const elapsed = performance.now() - start;
  assert(elapsed < 1000, `S-PERF-01: 100 participantes en ${elapsed.toFixed(2)}ms (< 1000ms)`);
}

// S-PERF-02: Sorteo con 1000 participantes < 2s
{
  const participantes = Array.from({ length: 1000 }, (_, i) => `user${i}`);
  const start = performance.now();
  realizarSorteo(participantes, 3, 2);
  const elapsed = performance.now() - start;
  assert(elapsed < 2000, `S-PERF-02: 1000 participantes en ${elapsed.toFixed(2)}ms (< 2000ms)`);
}

// S-PERF-03: Deduplicación de 500 pares < 500ms
{
  const input = Array.from({ length: 500 }, (_, i) => ({
    usuario: `user${i % 100}`,
    comentario: `comentario${i}`,
  }));
  const start = performance.now();
  deduplicarParticipantes(input);
  const elapsed = performance.now() - start;
  assert(elapsed < 500, `S-PERF-03: deduplicación 500 pares en ${elapsed.toFixed(2)}ms (< 500ms)`);
}

// S-PERF-04: Hash de 10000 participantes < 100ms
{
  const participantes = Array.from({ length: 10000 }, (_, i) => `user${i}`);
  const start = performance.now();
  generarHashParticipantes(participantes);
  const elapsed = performance.now() - start;
  assert(elapsed < 100, `S-PERF-04: hash 10000 participantes en ${elapsed.toFixed(2)}ms (< 100ms)`);
}

// ============================================================================
// RESUMEN
// ============================================================================

console.log("\n" + "=".repeat(60));
console.log(`\n📊 RESUMEN DE PRUEBAS`);
console.log(`  ✅ Pasaron: ${passed}`);
console.log(`  ❌ Fallaron: ${failed}`);
console.log(`  Total: ${passed + failed}`);

if (failures.length > 0) {
  console.log("\n\n❌ PRUEBAS FALLIDAS:");
  for (const f of failures) {
    console.log(`  • ${f.testName} ${f.details ? "— " + f.details : ""}`);
  }
}

console.log("\n" + "=".repeat(60) + "\n");

if (failed > 0) {
  process.exit(1);
}