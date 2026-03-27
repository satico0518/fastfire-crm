import { AuthService } from '../auth.service';
import { User } from '../../interfaces/User';

// Mock de Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockSignOut = jest.fn();
const mockGetIdToken = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args)
}));

// Mock de Firebase Database
const mockRef = jest.fn();
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();

jest.mock('firebase/database', () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  set: (...args: unknown[]) => mockSet(...args),
  get: (...args: unknown[]) => mockGet(...args),
  update: (...args: unknown[]) => mockUpdate(...args)
}));

// Mock de firebase config
jest.mock('../../firebase/firebase.config', () => ({
  auth: {
    signOut: () => mockSignOut(),
    currentUser: { uid: 'test-user-uid' }
  },
  db: {}
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    test('debe iniciar sesión exitosamente con credenciales válidas', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        getIdToken: mockGetIdToken.mockResolvedValue('mock-token')
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      mockGet.mockResolvedValue({
        val: () => ({
          'user123': {
            key: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            permissions: ['TYG'],
            workgroupKeys: ['wg1']
          }
        })
      });

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.result).toBe('OK');
      expect(result.user).toBeDefined();
      expect(result.firebaseUser).toBeDefined();
    });

    test('debe retornar error cuando el usuario no está registrado', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        getIdToken: mockGetIdToken.mockResolvedValue('mock-token')
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      mockGet.mockResolvedValue({
        val: () => ({
          'user456': {
            key: 'user456',
            email: 'other@example.com',
            isActive: true
          }
        })
      });

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.result).toBe('ERROR');
      expect(result.error).toContain('no está registrado');
    });

    test('debe retornar error cuando el usuario está inactivo', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        getIdToken: mockGetIdToken.mockResolvedValue('mock-token')
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      mockGet.mockResolvedValue({
        val: () => ({
          'user123': {
            key: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isActive: false,
            permissions: ['TYG'],
            workgroupKeys: ['wg1']
          }
        })
      });

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.result).toBe('ERROR');
      expect(result.error).toContain('inactivo');
    });

    test('debe retornar error cuando las credenciales son inválidas', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error('auth/invalid-credential'));

      const result = await AuthService.signIn('test@example.com', 'wrongpassword');

      expect(result.result).toBe('ERROR');
    });
  });

  describe('createUser', () => {
    test('debe crear usuario exitosamente', async () => {
      const mockUserCredential = {
        user: {
          uid: 'new-user-uid',
          email: 'newuser@example.com',
          getIdToken: jest.fn().mockResolvedValue('new-token')
        }
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockSet.mockResolvedValue(undefined);

      const newUser: User = {
        key: 'new-user-uid',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: ['wg1']
      };

      const result = await AuthService.createUser(newUser);

      expect(result.result).toBe('OK');
      expect(mockSet).toHaveBeenCalled();
    });

    test('debe retornar error cuando el email ya está en uso', async () => {
      const error = { code: 'auth/email-already-in-use' };
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

      const newUser: User = {
        key: 'new-user-uid',
        email: 'existing@example.com',
        firstName: 'New',
        lastName: 'User',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: ['wg1']
      };

      const result = await AuthService.createUser(newUser);

      expect(result.result).toBe('ERROR');
      expect(result.errorMessage).toContain('ya fue creado');
    });

    test('debe asignar contraseña diferente para proveedores', async () => {
      const mockUserCredential = {
        user: {
          uid: 'provider-uid',
          email: 'provider@example.com',
          getIdToken: jest.fn().mockResolvedValue('token')
        }
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockSet.mockResolvedValue(undefined);

      const providerUser: User = {
        key: 'provider-uid',
        email: 'provider@example.com',
        firstName: 'Provider',
        lastName: 'User',
        isActive: true,
        permissions: ['PROVIDER'],
        workgroupKeys: ['wg1']
      };

      const result = await AuthService.createUser(providerUser);

      expect(result.result).toBe('OK');
      // Verifica que se llamó con la contraseña de proveedor
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'provider@example.com',
        'P12345'
      );
    });
  });

  describe('LogOut', () => {
    test('debe cerrar sesión exitosamente', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const result = await AuthService.LogOut();

      expect(result.result).toBe('OK');
      expect(mockSignOut).toHaveBeenCalled();
    });

    test('debe retornar error cuando falla el cierre de sesión', async () => {
      mockSignOut.mockRejectedValue(new Error('Logout error'));

      const result = await AuthService.LogOut();

      expect(result.result).toBe('ERROR');
      expect(result.errorMessage).toContain('Error cerrando sesión');
    });
  });

  describe('changePassword', () => {
    test('debe enviar email de reset de contraseña exitosamente', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await AuthService.changePassword('user@example.com');

      expect(result.result).toBe('OK');
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com'
      );
    });

    test('debe retornar error cuando falla el envío de email', async () => {
      mockSendPasswordResetEmail.mockRejectedValue(new Error('Email error'));

      const result = await AuthService.changePassword('user@example.com');

      expect(result.result).toBe('ERROR');
      expect(result.errorMessage).toContain('Error enviando correo');
    });
  });
});
