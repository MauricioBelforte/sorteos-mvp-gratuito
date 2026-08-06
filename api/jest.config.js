/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/src'],
  // Aislar módulos que dependen de Prisma/Playwright en tests unitarios
  moduleNameMapper: {
    '^@shared/mercadopago$': '<rootDir>/../shared-modules/mercadopago/src/index.ts',
  },
  collectCoverageFrom: [
    'src/lib/verificacion.ts',
    'src/lib/sorteos-service.ts',
    'src/lib/cuota.ts',
    'src/lib/pases.ts',
    'src/collectors/parsers/instagram-paste.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};