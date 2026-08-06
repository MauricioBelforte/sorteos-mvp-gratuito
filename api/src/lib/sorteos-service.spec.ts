import { calcularPrecio, deduplicarParticipantes } from './sorteos-service';

// Mock de dependencias pesadas del módulo real
jest.mock('./prisma', () => ({
  __esModule: true,
  default: {
    sorteo: { create: jest.fn(), update: jest.fn() },
    participante: { create: jest.fn() },
    certificado: { create: jest.fn() },
  },
}));

jest.mock('../collectors', () => ({
  recolectarComentarios: jest.fn(),
  parsearParticipantesManuales: jest.fn(),
}));

jest.mock('./cookies', () => ({
  construirCookiesCompletas: jest.fn(() => ''),
}));

jest.mock('./cuota', () => ({
  CuotaAgotadaError: class extends Error {},
  PRECIO_PASE_COLA: 2500,
}));

jest.mock('./pases', () => ({
  PaseInvalidoError: class extends Error {},
  consumirPase: jest.fn(),
  validarPase: jest.fn(),
}));

describe('Modelo de Precios (calcularPrecio)', () => {
  it('debería ser gratis para 0-1000 comentarios', () => {
    expect(calcularPrecio(0)).toBe(0);
    expect(calcularPrecio(500)).toBe(0);
    expect(calcularPrecio(1000)).toBe(0);
  });

  it('debería costar $5000 para 1001-2000 comentarios', () => {
    expect(calcularPrecio(1001)).toBe(5000);
    expect(calcularPrecio(1500)).toBe(5000);
    expect(calcularPrecio(2000)).toBe(5000);
  });

  it('debería costar $6000 para 2001-3000 comentarios', () => {
    expect(calcularPrecio(2001)).toBe(6000);
    expect(calcularPrecio(3000)).toBe(6000);
  });

  it('debería costar $10000 para 3001-10000 comentarios', () => {
    expect(calcularPrecio(3001)).toBe(10000);
    expect(calcularPrecio(10000)).toBe(10000);
  });

  it('debería escalar $1000 por cada 1000 adicionales después de 10000', () => {
    expect(calcularPrecio(10001)).toBe(11000);
    expect(calcularPrecio(11000)).toBe(11000);
    expect(calcularPrecio(11001)).toBe(12000);
    expect(calcularPrecio(20000)).toBe(20000);
  });
});

describe('Deduplicación de Participantes (deduplicarParticipantes)', () => {
  it('debería eliminar duplicados exactos', () => {
    const participantes = [
      { usuario: 'user1', comentario: 'hola' },
      { usuario: 'user1', comentario: 'hola' },
    ];

    const resultado = deduplicarParticipantes(participantes);

    expect(resultado).toHaveLength(1);
  });

  it('debería eliminar duplicados case-insensitive en usuario', () => {
    const participantes = [
      { usuario: 'User1', comentario: 'hola' },
      { usuario: 'user1', comentario: 'hola' },
    ];

    const resultado = deduplicarParticipantes(participantes);

    expect(resultado).toHaveLength(1);
  });

  it('NO debería eliminar duplicados cuando el comentario difiere solo en mayúsculas (BUG conocido)', () => {
    const participantes = [
      { usuario: 'user1', comentario: 'Hola' },
      { usuario: 'user1', comentario: 'HOLA' },
    ];

    const resultado = deduplicarParticipantes(participantes);

    // BUG: toLowerCase() no se aplica al comentario en sorteos-service.ts:46
    expect(resultado).toHaveLength(2);
  });

  it('debería retornar array vacío para entrada vacía', () => {
    expect(deduplicarParticipantes([])).toEqual([]);
  });

  it('debería mantener participantes únicos', () => {
    const participantes = [
      { usuario: 'user1', comentario: 'hola' },
      { usuario: 'user2', comentario: 'chau' },
      { usuario: 'user3', comentario: 'genial' },
    ];

    const resultado = deduplicarParticipantes(participantes);

    expect(resultado).toHaveLength(3);
  });

  it('debería conservar solo 3 únicos de 6 con múltiples duplicados', () => {
    const participantes = [
      { usuario: 'user1', comentario: 'hola' },
      { usuario: 'user1', comentario: 'hola' },
      { usuario: 'user1', comentario: 'hola' },
      { usuario: 'user2', comentario: 'chau' },
      { usuario: 'user2', comentario: 'chau' },
      { usuario: 'user3', comentario: 'ok' },
    ];

    const resultado = deduplicarParticipantes(participantes);

    expect(resultado).toHaveLength(3);
  });
});