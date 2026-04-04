/** @type {import('jest').Config} */

module.exports = {
  // Directorio raíz de los archivos fuente y tests
  roots: ['<rootDir>/src'],

  // Entorno de testing — JSDOM para simular el browser
  testEnvironment: 'jsdom',

  // Setup ejecutado después de que el framework de testing se inicializa
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  // Patrón canónico de Jest para detectar archivos de test
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Transformación con babel-jest (TypeScript via @babel/preset-typescript)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Ignorar node_modules y módulos CSS
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.module\\.(css|sass|scss)$',
  ],

  // TS primero — resolución más eficiente en proyectos TypeScript
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Alias y mocks de assets/estilos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': '<rootDir>/src/test/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/fileMock.js',
  },

  // Configuración de cobertura
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(ts|tsx)',
    '!src/**/__tests__/**',
    '!src/**/*.test.(ts|tsx)',
    '!src/**/*.spec.(ts|tsx)',
    '!src/main.tsx',
    '!src/firebase/**',
  ],

  // Umbrales de cobertura mínima
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },

  // Comportamiento de mocks entre tests
  clearMocks: true,      // Limpia llamadas/instancias/resultados registrados
  restoreMocks: true,    // Restaura implementaciones originales de spies

  // Tiempo máximo por test (ms) — explícito para tests de MUI complejos
  testTimeout: 10000,

  verbose: true,
};
