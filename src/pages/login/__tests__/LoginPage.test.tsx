import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';

// ─── Mocks de navegación ───────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetNewUser = jest.fn();
const mockSetIsAuth = jest.fn();
const mockSetToken = jest.fn();
const mockSetIsLoading = jest.fn();

jest.mock('../../../stores', () => ({
  useAuthStore: jest.fn((selector: Function) =>
    selector({
      setNewUser: mockSetNewUser,
      setIsAuth: mockSetIsAuth,
      setToken: mockSetToken,
    })
  ),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setIsLoading: mockSetIsLoading,
      isLoading: false,
    })
  ),
}));

// ─── Mock de AuthService ─────────────────────────────────────────────────────
const mockSignIn = jest.fn();
jest.mock('../../../services/auth.service', () => ({
  AuthService: {
    signIn: (...args: any[]) => mockSignIn(...args),
  },
}));

// ─── Helper de render ─────────────────────────────────────────────────────────
const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado inicial', () => {
    test('debe renderizar el formulario de login', () => {
      renderPage();
      expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    test('no debe mostrar errores al inicio', () => {
      renderPage();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('validaciones de formulario', () => {
    test('debe mostrar error de validación si se envía vacío', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
      // react-hook-form mantiene el form sin submit si validation falla
      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
      });
    });

    test('debe llamar a signIn con las credenciales ingresadas', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'OK',
        firebaseUser: { getIdToken: jest.fn().mockResolvedValue('token123') },
        user: { key: 'u1', firstName: 'Test', permissions: ['ADMIN'] },
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
      });
    });
  });

  describe('flujo de login exitoso', () => {
    test('debe navegar a /home tras login exitoso', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'OK',
        firebaseUser: { getIdToken: jest.fn().mockResolvedValue('token123') },
        user: { key: 'u1', firstName: 'Test', permissions: ['ADMIN'] },
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
        expect(mockSetIsAuth).toHaveBeenCalledWith(true);
        expect(mockSetNewUser).toHaveBeenCalled();
      });
    });

    test('debe llamar setIsLoading(true) y luego setIsLoading(false)', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'OK',
        firebaseUser: { getIdToken: jest.fn().mockResolvedValue('tok') },
        user: { key: 'u1' },
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(mockSetIsLoading).toHaveBeenCalledWith(true);
        expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('flujo de login fallido', () => {
    test('debe mostrar error para credenciales inválidas (invalid-credential)', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'ERROR',
        error: 'auth/invalid-credential',
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error para too-many-requests', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'ERROR',
        error: 'auth/too-many-requests',
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/bloqueada temporalmente/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error para user-disabled', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'ERROR',
        error: 'auth/user-disabled',
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/deshabilitada/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error para invalid-email', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'ERROR',
        error: 'auth/invalid-email',
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'bademail' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/formato del correo/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar error de red para network-request-failed', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'ERROR',
        error: 'auth/network-request-failed',
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/conexión/i)).toBeInTheDocument();
      });
    });

    test('debe manejar excepción de red lanzada por el servicio', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Network error occurred'));

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/conexión a internet/i)).toBeInTheDocument();
      });
    });

    test('debe manejar excepción genérica del servicio', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Some unexpected error'));

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/servidor/i)).toBeInTheDocument();
      });
    });

    test('debe manejar mensaje de error legible (sin códigos)', async () => {
      mockSignIn.mockResolvedValueOnce({
        result: 'ERROR',
        error: 'El usuario no tiene permiso para acceder al sistema',
      });

      renderPage();
      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});
