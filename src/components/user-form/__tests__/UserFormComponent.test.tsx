import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserFormComponent } from '../UserFormComponent';
import { User } from '../../../interfaces/User';

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetIsLoading = jest.fn();
const mockSetModal = jest.fn();
const mockSetSnackbar = jest.fn();

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setIsLoading: mockSetIsLoading,
      modal: { open: true },
      setModal: mockSetModal,
      snackbar: { open: false },
      setSnackbar: mockSetSnackbar,
    })
  ),
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector: Function) =>
    selector({
      workgroups: [
        { key: 'wg1', name: 'Grupo Alpha', isActive: true },
        { key: 'wg2', name: 'Grupo Beta', isActive: true },
      ],
    })
  ),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/auth.service', () => ({
  AuthService: {
    createUser: jest.fn().mockResolvedValue({ result: 'OK' }),
  },
}));

jest.mock('../../../services/users.service', () => ({
  UsersService: {
    modifyUser: jest.fn().mockResolvedValue({ result: 'OK' }),
  },
}));

// ─── Mock MultiselectComponent ───────────────────────────────────────────────
jest.mock('../../multi-select/MultiselectComponent', () => ({
  MultiselectComponent: ({ title, setValue, value }: any) => (
    <div data-testid={`multiselect-${title}`}>
      <span data-testid="selected-count">{value?.length || 0}</span>
      <button type="button" onClick={() => setValue(['Grupo Alpha'])}>{title} select</button>
    </div>
  ),
}));

// ─── Usuario de edición ──────────────────────────────────────────────────────
const mockEditingUser: User = {
  key: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com',
  isActive: true, permissions: ['TYG', 'ADMIN'], workgroupKeys: ['wg1'],
};

const mockProviderUser: User = {
  key: 'provider-1', firstName: 'Prov', lastName: 'Uno', email: 'prov@test.com',
  isActive: true, permissions: ['PROVIDER'], workgroupKeys: [],
};

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('UserFormComponent', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillMandatoryFields = async () => {
    const fnInput = screen.getByLabelText(/Nombre/i);
    const lnInput = screen.getByLabelText(/Apellido/i);
    const emInput = screen.getByLabelText(/Correo/i);
    await user.clear(fnInput);
    await user.type(fnInput, 'Test');
    await user.clear(lnInput);
    await user.type(lnInput, 'User');
    await user.clear(emInput);
    await user.type(emInput, 'test@test.com');
  };

  // ── Modo creación ─────────────────────────────────────────────────────────
  describe('renderizado inicial', () => {
    test('debe mostrar inputs básicos', () => {
      render(<UserFormComponent />);
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument();
    });

    test('debe mostrar los checkboxes de permisos', () => {
      render(<UserFormComponent />);
      expect(screen.getByLabelText(/Tareas y Grupos/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Admin$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Proveedor/i)).toBeInTheDocument();
    });
  });

  // ── Modo usuario PROVIDER ─────────────────────────────────────────────────
  describe('usuario PROVIDER', () => {
    test('no muestra checkboxes de permisos para usuarios PROVIDER en edición', () => {
      render(<UserFormComponent editingUser={mockProviderUser} />);
      expect(screen.queryByLabelText(/Tareas y Grupos/i)).not.toBeInTheDocument();
    });

    test('al activar PROVIDER los otros checkboxes quedan disabled y oculta multiselect', async () => {
      render(<UserFormComponent />);
      await user.click(screen.getByLabelText(/Proveedor/i));
      expect(screen.getByLabelText(/^Admin$/i)).toBeDisabled();
      expect(screen.queryByTestId('multiselect-Grupos de trabajo')).not.toBeInTheDocument();
    });
  });

  // ── Flujos de Envío ───────────────────────────────────────────────────────
  describe('flujos de envío', () => {
    test('debe mostrar warning si se envía sin grupo de trabajo seleccionado (y no es PROVIDER)', async () => {
      render(<UserFormComponent />);
      await fillMandatoryFields();
      await user.click(screen.getByRole('button', { name: /Crear Usuario/i }));

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: 'warning',
            message: 'Debe seleccionar al menos un grupo de trabajo!',
          })
        );
      });
    });

    test('debe llamar a createUser con grupo seleccionado', async () => {
      const { AuthService } = require('../../../services/auth.service');
      render(<UserFormComponent />);
      await fillMandatoryFields();
      
      // Seleccionar grupo vía el mock
      await user.click(screen.getByText('Grupos de trabajo select'));
      
      // Enviar
      await user.click(screen.getByRole('button', { name: /Crear Usuario/i }));

      await waitFor(() => {
        expect(AuthService.createUser).toHaveBeenCalled();
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'success' })
        );
      });
    });

    test('debe llamar a modifyUser (no createUser) en modo edición', async () => {
      const { UsersService } = require('../../../services/users.service');
      const { AuthService } = require('../../../services/auth.service');
      render(<UserFormComponent editingUser={mockEditingUser} />);

      // En el modo edición ya viene con datos, pero rellenamos por si acaso
      await user.click(screen.getByText('Grupos de trabajo select'));
      await user.click(screen.getByRole('button', { name: /Editar Usuario/i }));

      await waitFor(() => {
        expect(UsersService.modifyUser).toHaveBeenCalled();
        expect(AuthService.createUser).not.toHaveBeenCalled();
      });
    });
  });

  // ── Manejo de Errores ─────────────────────────────────────────────────────
  describe('manejo de errores', () => {
    test('debe mostrar snackbar error si createUser falla', async () => {
      const { AuthService } = require('../../../services/auth.service');
      AuthService.createUser.mockResolvedValueOnce({ result: 'ERROR_AUTH' });
      render(<UserFormComponent />);
      await fillMandatoryFields();
      await user.click(screen.getByText('Grupos de trabajo select'));
      await user.click(screen.getByRole('button', { name: /Crear Usuario/i }));

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error' })
        );
      });
    });

    test('debe llamar a setIsLoading(false) al final incluso con error', async () => {
      const { AuthService } = require('../../../services/auth.service');
      AuthService.createUser.mockRejectedValueOnce(new Error('Network Fail'));
      render(<UserFormComponent />);
      await fillMandatoryFields();
      await user.click(screen.getByText('Grupos de trabajo select'));
      await user.click(screen.getByRole('button', { name: /Crear Usuario/i }));

      await waitFor(() => {
        expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      });
    });
  });
});
