// Additional tests for auth.service.ts covering uncovered lines 41-42, 50, 145-153
import { AuthService } from '../auth.service';
import { User } from '../../interfaces/User';

const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockSignOut = jest.fn();
const mockSet = jest.fn();
const mockGet = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  sendPasswordResetEmail: jest.fn(),
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({})),
  set: (...args: unknown[]) => mockSet(...args),
  get: (...args: unknown[]) => mockGet(...args),
  update: jest.fn(),
}));

jest.mock('../../firebase/firebase.config', () => ({
  auth: { signOut: () => mockSignOut(), currentUser: { uid: 'test-uid' } },
  db: {},
}));

describe('AuthService - ramas no cubiertas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser - error en escritura a base de datos', () => {
    test('debe relanzar error cuando falla la escritura en DB (línea 41-42)', async () => {
      const mockUserCredential = {
        user: {
          uid: 'new-uid',
          email: 'test@test.com',
          getIdToken: jest.fn().mockResolvedValue('token'),
        },
      };
      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockSet.mockRejectedValue(new Error('DB write failed'));

      const user: User = {
        key: '',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: [],
      };

      const result = await AuthService.createUser(user);
      // Error is caught by outer try-catch, returns ERROR
      expect(result.result).toBe('ERROR');
    });

    test('debe retornar ERROR si createUserWithEmailAndPassword retorna null user (línea 50)', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: null });

      const user: User = {
        key: '',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: [],
      };

      const result = await AuthService.createUser(user);
      expect(result.result).toBe('ERROR');
      expect(result.errorMessage).toContain('Error al intentar crear usuario');
    });
  });

  describe('signInAnonymously (líneas 144-157)', () => {
    test('debe iniciar sesión anónima exitosamente', async () => {
      const mockAnonUser = { uid: 'anon-uid', isAnonymous: true };
      mockSignInAnonymously.mockResolvedValue({ user: mockAnonUser });

      const result = await AuthService.signInAnonymously();
      expect(result.result).toBe('OK');
      expect(result.user).toEqual(mockAnonUser);
    });

    test('debe retornar ERROR cuando falla el inicio anónimo', async () => {
      mockSignInAnonymously.mockRejectedValue(new Error('Anon auth failed'));

      const result = await AuthService.signInAnonymously();
      expect(result.result).toBe('ERROR');
      expect(result.errorMessage).toContain('Error en autenticación anónima');
    });
  });
});
