// Mock de ResizeObserver - debe estar antes de importar testing-library
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

const { TextEncoder, TextDecoder } = require('util');

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

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

const createMatchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock de window.matchMedia estable para tests con resetMocks=true
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => createMatchMedia(query),
});

beforeEach(() => {
  window.matchMedia = (query) => createMatchMedia(query);
});
