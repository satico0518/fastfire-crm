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
    // ── Excluir infraestructura y declaraciones ──────────────────────────────
    '!src/**/*.d.ts',
    '!src/main.tsx',                           // entry point — no testeable
    '!src/firebase/**',                        // infraestructura de conexión
    '!src/stores/index.ts',                    // barrel export puro
    // ── Excluir archivos de configuración estática ───────────────────────────
    '!src/config/**',                          // catálogos de datos estáticos
    // ── Excluir mocks y helpers de test ──────────────────────────────────────
    '!src/**/*.mock.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.(ts|tsx)',
    '!src/**/*.spec.(ts|tsx)',
    '!src/**/*.stories.(ts|tsx)',
    // ── Excluir componentes de UI sin lógica de negocio ──────────────────────
    // (wrappers de librerías externas, layouts puros)
    '!src/components/signature-pad/**',
    '!src/components/comercial-container/**',
    '!src/components/provider-container/**',
    // ── Excluir páginas de sólo-renderizado complejas ────────────────────────
    '!src/pages/formats/PublicFormatPage.tsx',
    '!src/pages/formats/PublicFormatResultsPage.tsx',
    '!src/pages/agenda-mantenimientos/components/ScheduleCard.tsx',
    '!src/pages/agenda-mantenimientos/components/ScheduleCreationModal.tsx',
    '!src/pages/agenda-mantenimientos/components/ScheduleDayBlock.tsx',
    '!src/pages/agenda-mantenimientos/components/ScheduleDetailModal.tsx',
  ],

  // ── Umbrales de cobertura mínima ──────────────────────────────────────────
  // Estado actual post-exclusiones: ~57% stmts | ~35% branches | ~53% fns
  // Plan de subida progresiva: +5% por sprint hasta llegar a 80%
  // Sprint actual → Sprint 2 → Sprint 3 → Sprint 4 (objetivo)
  //   stmts:   52%  →  60%  →  68%  →  78%
  //   branches:32%  →  42%  →  52%  →  62%
  //   fns:     45%  →  55%  →  65%  →  75%
  //   lines:   52%  →  60%  →  68%  →  78%
  coverageThreshold: {
    global: {
      branches: 32,   // actual: ~36%
      functions: 45,  // actual: ~47%
      lines: 52,      // actual: ~54%
      statements: 52, // actual: ~53%
    },
  },

  // Comportamiento de mocks entre tests
  clearMocks: true,      // Limpia llamadas/instancias/resultados registrados
  restoreMocks: true,    // Restaura implementaciones originales de spies

  // Tiempo máximo por test (ms) — explícito para tests de MUI complejos
  testTimeout: 10000,

  verbose: true,
};
