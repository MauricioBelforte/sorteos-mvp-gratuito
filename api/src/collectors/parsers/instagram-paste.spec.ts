import { parsearTextoInstagramPegado, pareceFormatoInstagram } from './instagram-paste';

describe('Parser de Instagram Pegado (instagram-paste.ts)', () => {
  describe('parsearTextoInstagramPegado', () => {
    it('debería parsear un username con su comentario', () => {
      // Arrange
      const texto = `karen_etcheverry\n125 sem\n@ailin_1453 @kevin_1495xd`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].usuario).toBe('karen_etcheverry');
      expect(resultado[0].comentario).toBe('@ailin_1453 @kevin_1495xd');
    });

    it('debería ignorar timestamps y textos de UI', () => {
      // Arrange
      const texto = `user1\n3 d\nFoto del perfil de user1\nhola que tal`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].usuario).toBe('user1');
      expect(resultado[0].comentario).toBe('hola que tal');
    });

    it('debería retornar array vacío para texto vacío', () => {
      // Act
      const resultado = parsearTextoInstagramPegado('');

      // Assert
      expect(resultado).toEqual([]);
    });

    it('debería retornar array vacío para texto con solo UI', () => {
      // Arrange
      const texto = `Foto del perfil de user1\nReply\nLike`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      expect(resultado).toEqual([]);
    });

    it('debería parsear múltiples usuarios', () => {
      // Arrange
      const texto = `user1\n125 sem\ncomentario uno\nuser2\n3 d\ncomentario dos`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0].usuario).toBe('user1');
      expect(resultado[1].usuario).toBe('user2');
    });

    it('debería deduplicar pares repetidos', () => {
      // Arrange
      // "hola" es un username válido (3+ chars), así que el parser lo interpreta
      // como username, no como comentario. Para probar deduplicación real,
      // usamos un comentario que NO sea username válido (con espacios).
      const texto = `user1\n125 sem\nhola que tal\nuser1\n125 sem\nhola que tal`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].usuario).toBe('user1');
      expect(resultado[0].comentario).toBe('hola que tal');
    });

    it('debería truncar comentarios a 500 caracteres', () => {
      // Arrange
      const comentarioLargo = 'a'.repeat(600);
      const texto = `user1\n125 sem\n${comentarioLargo}`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].comentario).toHaveLength(500);
    });

    it('debería ignorar usernames con menos de 3 caracteres', () => {
      // Arrange
      // "ab" no es username válido (< 3 chars), pero "comentario" sí lo es (10 chars),
      // así que el parser lo interpreta como username. Para probar que ignora
      // usernames cortos, usamos un texto donde el username corto no genera par.
      const texto = `ab\n125 sem\nhola que tal`;

      // Act
      const resultado = parsearTextoInstagramPegado(texto);

      // Assert
      // "ab" no es username válido, y "hola que tal" no es username válido (tiene espacios)
      expect(resultado).toEqual([]);
    });
  });

  describe('pareceFormatoInstagram', () => {
    it('debería retornar true para texto con formato de Instagram', () => {
      // Arrange
      const lineas = ['user1', '125 sem', 'comentario', 'user2', '3 d', 'otro comentario'];

      // Act
      const resultado = pareceFormatoInstagram(lineas);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería retornar false para menos de 4 líneas', () => {
      // Arrange
      const lineas = ['user1', '125 sem', 'comentario'];

      // Act
      const resultado = pareceFormatoInstagram(lineas);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería retornar false para texto sin formato de Instagram', () => {
      // Arrange
      const lineas = ['@user1 hola', '@user2 chau', '@user3 ok', '@user4 genial'];

      // Act
      const resultado = pareceFormatoInstagram(lineas);

      // Assert
      expect(resultado).toBe(false);
    });
  });
});