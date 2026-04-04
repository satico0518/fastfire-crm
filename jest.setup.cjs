// Polyfills y configuraciones globales para Jest (JSDOM)

// Mock de matchMedia
const matchMediaMock = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(matchMediaMock),
});

global.matchMedia = window.matchMedia;

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill para fetch (JSDOM no lo incluye)
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);

// Mock de FileReader
global.FileReader = class FileReader {
  constructor() {
    this.onloadend = null;
    this.onerror = null;
    this.result = 'data:image/png;base64,test';
  }
  readAsDataURL() {
    // Síncrono en ambiente de test — evita flakiness con async/await
    if (this.onloadend) this.onloadend();
  }
};

// Mock de Image
global.Image = class Image {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this._src = '';
    this.width = 100;
    this.height = 100;
  }
  set src(value) {
    this._src = value;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 1);
  }
  get src() {
    return this._src;
  }
};

// Mock de URL.createObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn();
}

// Polyfills para TextEncoder y TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configuración de Jest-DOM
require('@testing-library/jest-dom');

// Mock de jsPDF (Global)
jest.mock('jspdf', () => {
  const mJsPDF = jest.fn().mockImplementation(() => {
    return {
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        }
      },
      addPage: jest.fn(),
      save: jest.fn(),
      text: jest.fn().mockReturnValue([]),
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      setFillColor: jest.fn(),
      setDrawColor: jest.fn(),
      setLineWidth: jest.fn(),
      line: jest.fn(),
      rect: jest.fn(),
      roundedRect: jest.fn(),
      addImage: jest.fn(),
      splitTextToSize: jest.fn().mockReturnValue(['text']),
      getNumberOfPages: jest.fn().mockReturnValue(1),
      setPage: jest.fn(),
      output: jest.fn().mockReturnValue('pdf-content'),
    };
  });
  return { 
    __esModule: true,
    jsPDF: mJsPDF,
    default: mJsPDF 
  };
});

jest.mock('jspdf-autotable', () => {
  const autoTable = jest.fn();
  autoTable.default = autoTable;
  autoTable.autoTable = autoTable;
  return {
    __esModule: true,
    default: autoTable,
    autoTable: autoTable
  };
});

// Mocks de Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
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
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/database', () => {
  const mockRef = { key: 'test-key' };
  return {
    getDatabase: jest.fn(() => ({})),
    ref: jest.fn(() => ({})),
    child: jest.fn(() => ({})),
    push: jest.fn(() => ({ key: 'new-key', ...mockRef })),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
    onValue: jest.fn((ref, callback) => {
      callback({ val: () => ({}), key: 'test-key' });
      return jest.fn(); // unsubscribe
    }),
    get: jest.fn(() => Promise.resolve({ val: () => ({}), exists: () => true })),
  };
});

jest.mock('./src/firebase/firebase.config', () => ({
  db: {},
  auth: {}
}));
