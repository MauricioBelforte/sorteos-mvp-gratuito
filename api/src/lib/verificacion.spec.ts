import { realizarSorteo, verificarSorteo, generarHashParticipantes, generarHashVerificacion, ResultadoSorteo } from './verificacion';

describe('Motor de Sorteos (verificacion.ts)', () => {
  describe('realizarSorteo', () => {
    it('debería retornar 1 ganador del pool cuando se pide 1 ganador con 10 participantes', () => {
      // Arrange
      const participantes = ['user1','user2','user3','user4','user5','user6','user7','user8','user9','user10'];

      // Act
      const resultado = realizarSorteo(participantes, 1, 0);

      // Assert
      expect(resultado.ganadores).toHaveLength(1);
      expect(participantes).toContain(resultado.ganadores[0]);
    });

    it('debería retornar 3 ganadores únicos cuando se piden 3 ganadores', () => {
      // Arrange
      const participantes = ['user1','user2','user3','user4','user5','user6','user7','user8','user9','user10'];

      // Act
      const resultado = realizarSorteo(participantes, 3, 0);

      // Assert
      expect(resultado.ganadores).toHaveLength(3);
      expect(new Set(resultado.ganadores).size).toBe(3);
    });

    it('debería retornar 5 ganadores y 2 suplentes sin repetición total', () => {
      // Arrange
      const participantes = ['user1','user2','user3','user4','user5','user6','user7','user8','user9','user10'];

      // Act
      const resultado = realizarSorteo(participantes, 5, 2);

      // Assert
      expect(resultado.ganadores).toHaveLength(5);
      expect(resultado.suplentes).toHaveLength(2);
      expect(new Set([...resultado.ganadores, ...resultado.suplentes]).size).toBe(7);
    });

    it('debería limitar la cantidad de ganadores al tamaño del pool', () => {
      // Arrange
      const participantes = ['user1','user2','user3','user4','user5'];

      // Act
      const resultado = realizarSorteo(participantes, 10, 0);

      // Assert
      expect(resultado.ganadores.length).toBeLessThanOrEqual(5);
    });

    it('debería lanzar error cuando no hay participantes', () => {
      // Arrange
      const participantes: string[] = [];

      // Act & Assert
      expect(() => realizarSorteo(participantes, 1, 0)).toThrow('No hay participantes');
    });

    it('debería retornar al único participante como ganador', () => {
      // Arrange
      const participantes = ['user1'];

      // Act
      const resultado = realizarSorteo(participantes, 1, 0);

      // Assert
      expect(resultado.ganadores).toEqual(['user1']);
    });

    it('debería generar hash de verificación de 64 caracteres (SHA-256)', () => {
      // Arrange
      const participantes = ['user1','user2','user3'];

      // Act
      const resultado = realizarSorteo(participantes, 3, 0);

      // Assert
      expect(resultado.hashVerificacion).toHaveLength(64);
      expect(resultado.participantesHash).toHaveLength(64);
    });

    it('debería ser determinístico: mismo input produce el mismo hash', () => {
      // Arrange
      const participantes = ['user1','user2','user3'];
      const timestamp = '2026-08-04T00:00:00.000Z';

      // Act
      const hash1 = generarHashVerificacion(participantes, timestamp);
      const hash2 = generarHashVerificacion(participantes, timestamp);

      // Assert
      expect(hash1).toBe(hash2);
    });

    it('debería ignorar duplicados en los participantes', () => {
      // Arrange
      const participantes = ['user1','user1','user2','user2','user3'];

      // Act
      const resultado = realizarSorteo(participantes, 3, 0);

      // Assert
      expect(resultado.ganadores).toHaveLength(3);
      expect(new Set(resultado.ganadores).size).toBe(3);
    });

    it('debería limitar suplentes a los restantes cuando se piden más', () => {
      // Arrange
      const participantes = ['user1','user2','user3'];

      // Act
      const resultado = realizarSorteo(participantes, 1, 10);

      // Assert
      expect(resultado.ganadores).toHaveLength(1);
      expect(resultado.suplentes.length).toBeLessThanOrEqual(2);
    });
  });

  describe('generarHashParticipantes', () => {
    it('debería generar el mismo hash independientemente del orden', () => {
      // Arrange
      const orden1 = ['user1','user2','user3'];
      const orden2 = ['user3','user1','user2'];

      // Act
      const hash1 = generarHashParticipantes(orden1);
      const hash2 = generarHashParticipantes(orden2);

      // Assert
      expect(hash1).toBe(hash2);
    });

    it('debería generar hash de 64 caracteres para array vacío', () => {
      // Act
      const hash = generarHashParticipantes([]);

      // Assert
      expect(hash).toHaveLength(64);
    });
  });

  describe('verificarSorteo', () => {
    it('debería retornar true cuando el hash es válido', () => {
      // Arrange
      const participantes = ['user1','user2','user3'];
      const timestamp = '2026-08-04T00:00:00.000Z';
      const hash = generarHashVerificacion(participantes, timestamp);

      // Act
      const esValido = verificarSorteo(participantes, timestamp, hash);

      // Assert
      expect(esValido).toBe(true);
    });

    it('debería retornar false cuando el hash es inválido', () => {
      // Arrange
      const participantes = ['user1','user2','user3'];
      const timestamp = '2026-08-04T00:00:00.000Z';

      // Act
      const esValido = verificarSorteo(participantes, timestamp, 'hash-invalid');

      // Assert
      expect(esValido).toBe(false);
    });

    it('debería retornar false cuando los participantes cambian', () => {
      // Arrange
      const participantesOriginales = ['user1','user2','user3'];
      const timestamp = '2026-08-04T00:00:00.000Z';
      const hash = generarHashVerificacion(participantesOriginales, timestamp);

      // Act
      const esValido = verificarSorteo(['user1','user2','user4'], timestamp, hash);

      // Assert
      expect(esValido).toBe(false);
    });
  });
});