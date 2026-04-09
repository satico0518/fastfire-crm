import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersTable from '../UsersTableComponent';
import { User } from '../../../interfaces/User';

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockUsers: User[] = [
  {
    key: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com',
    isActive: true, permissions: ['TYG', 'ADMIN'], workgroupKeys: ['wg1'], color: '#0a84ff',
  },
  {
    key: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com',
    isActive: true, permissions: ['PROVIDER'], workgroupKeys: [],
  },
  {
    // Usuario inactivo — no debe aparecer
    key: 'u3', firstName: 'Carlos', lastName: 'López', email: 'carlos@test.com',
    isActive: false, permissions: ['TYG'], workgroupKeys: ['wg1'],
  },
];

// ─── Mock de DataGrid ─────────────────────────────────────────────────────────
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: jest.fn(({ rows, columns }) => (
    <table role="grid">
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.field}>{col.headerName || col.field}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.key}>
            {columns.map((col: any) => (
              <td key={col.field}>
                {col.type === 'actions'
                  ? col.getActions?.({ row, id: row.key })
                  : col.renderCell
                    ? col.renderCell({ row, value: row[col.field] })
                    : String(row[col.field] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )),
  GridActionsCellItem: jest.fn(({ label, onClick }: any) => (
    <button type="button" aria-label={label} onClick={onClick}>{label}</button>
  )),
}));

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetSnackbar = jest.fn();
const mockSetConfirmation = jest.fn();
const mockSetModal = jest.fn();

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setSnackbar: mockSetSnackbar,
      setConfirmation: mockSetConfirmation,
      modal: { open: false },
      setModal: mockSetModal,
    })
  ),
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector: Function) => selector({ users: mockUsers })),
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector: Function) =>
    selector({
      workgroups: [
        { key: 'wg1', name: 'Grupo Alpha', color: '#ff9f0a', isActive: true },
      ],
    })
  ),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/users.service', () => ({
  UsersService: {
    deleteUser: jest.fn().mockResolvedValue({ result: 'OK' }),
  },
}));

// ─── Mocks de utils ──────────────────────────────────────────────────────────
jest.mock('../../../utils/utils', () => ({
  getWorkgroupNameByKey: jest.fn((key: string) => key === 'wg1' ? 'Grupo Alpha' : 'NA'),
  getWorkgroupColorByKey: jest.fn(() => '#ff9f0a'),
  translateAccess: jest.fn((acc: string) => acc),
}));

jest.mock('../../user-form/UserFormComponent', () => ({
  UserFormComponent: ({ editingUser }: any) => (
    <div data-testid="user-form-edit">{editingUser?.firstName}</div>
  ),
}));

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('UsersTableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Renderizado ──────────────────────────────────────────────────────────
  describe('renderizado', () => {
    test('debe renderizar sin errores', () => {
      render(<UsersTable />);
      expect(document.body).toBeTruthy();
    });

    test('debe mostrar el grid de usuarios', () => {
      render(<UsersTable />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    test('debe mostrar la columna "Nombre"', () => {
      render(<UsersTable />);
      expect(screen.getByText('Nombre')).toBeInTheDocument();
    });

    test('debe mostrar la columna "Correo"', () => {
      render(<UsersTable />);
      expect(screen.getByText('Correo')).toBeInTheDocument();
    });

    test('debe mostrar la columna "Grupos de trabajo"', () => {
      render(<UsersTable />);
      expect(screen.getByText('Grupos de trabajo')).toBeInTheDocument();
    });

    test('debe mostrar la columna "Permisos"', () => {
      render(<UsersTable />);
      expect(screen.getByText('Permisos')).toBeInTheDocument();
    });

    test('debe filtrar usuarios inactivos', () => {
      render(<UsersTable />);
      // Carlos es isActive=false, no debe aparecer
      expect(screen.queryByText('carlos@test.com')).not.toBeInTheDocument();
    });

    test('debe mostrar los emails de usuarios activos', () => {
      render(<UsersTable />);
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
      expect(screen.getByText('bob@test.com')).toBeInTheDocument();
    });
  });

  // ── Acciones ──────────────────────────────────────────────────────────────
  describe('acciones de fila', () => {
    test('debe mostrar botones de Modificar por fila activa', () => {
      render(<UsersTable />);
      const editBtns = screen.getAllByLabelText('Modificar');
      expect(editBtns.length).toBeGreaterThanOrEqual(1);
    });

    test('debe abrir modal de edición al hacer click en Modificar', () => {
      render(<UsersTable />);
      fireEvent.click(screen.getAllByLabelText('Modificar')[0]);
      expect(mockSetModal).toHaveBeenCalledWith(
        expect.objectContaining({ open: true, title: 'Editar Usuario' })
      );
    });

    test('debe abrir confirmación al hacer click en Eliminar', () => {
      render(<UsersTable />);
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);
      expect(mockSetConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ open: true, title: 'Confirmacion!' })
      );
    });

    test('la confirmación de PROVIDER menciona licitaciones', () => {
      render(<UsersTable />);
      // Bob (índice 1) es PROVIDER
      fireEvent.click(screen.getAllByLabelText('Eliminar')[1]);
      const callArg = (mockSetConfirmation as jest.Mock).mock.calls[0][0];
      expect(callArg.text).toContain('licitaciones');
    });

    test('la confirmación de usuario normal NO menciona licitaciones', () => {
      render(<UsersTable />);
      // Alice (índice 0) no es PROVIDER
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);
      const callArg = (mockSetConfirmation as jest.Mock).mock.calls[0][0];
      expect(callArg.text).not.toContain('licitaciones');
    });
  });

  // ── Flujo de eliminación ──────────────────────────────────────────────────
  describe('flujo completo de eliminación', () => {
    test('debe llamar a deleteUser con la key correcta al confirmar', async () => {
      const { UsersService } = require('../../../services/users.service');
      render(<UsersTable />);

      // Abrir confirmación de Alice (u1)
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);

      // Extraer y renderizar el botón de acción del diálogo
      const actionsJSX = (mockSetConfirmation as jest.Mock).mock.calls[0][0].actions;
      render(actionsJSX);
      // El de la tabla ya estaba, el nuevo es el del diálogo. Usamos el último.
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);

      await waitFor(() => {
        expect(UsersService.deleteUser).toHaveBeenCalledWith('u1');
      });
    });

    test('debe mostrar snackbar tras la eliminación', async () => {
      render(<UsersTable />);
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);

      const actionsJSX = (mockSetConfirmation as jest.Mock).mock.calls[0][0].actions;
      render(actionsJSX);
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ open: true })
        );
      });
    });

    test('debe cerrar el diálogo de confirmación tras la eliminación', async () => {
      render(<UsersTable />);
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);

      const actionsJSX = (mockSetConfirmation as jest.Mock).mock.calls[0][0].actions;
      render(actionsJSX);
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);

      await waitFor(() => {
        expect(mockSetConfirmation).toHaveBeenCalledWith(
          expect.objectContaining({ open: false })
        );
      });
    });
  });
});
