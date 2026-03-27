// Mock de ResizeObserver - debe estar antes de importar testing-library
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Configuración de Jest - Importar testing library después de los mocks globales
require('@testing-library/jest-dom');

// Mock del archivo de configuración de Firebase
jest.mock('./src/firebase/firebase.config', () => ({
  db: {},
  auth: {}
}));

// Mock de Firebase para pruebas
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getDatabase: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}));

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
