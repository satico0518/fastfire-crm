import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkgroupsTable from '../WorkgroupsTableComponent';
import { Workgroup } from '../../../interfaces/Workgroup';
import { User } from '../../../interfaces/User';
import { Task } from '../../../interfaces/Task';

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockUsers: User[] = [
  { key: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', isActive: true, permissions: ['TYG'], workgroupKeys: ['wg1'] },
];

const mockWorkgroups: Workgroup[] = [
  { key: 'wg1', name: 'Grupo Alpha', description: 'Desc Alpha', color: '#ff0000', isPrivate: true, memberKeys: ['u1'], isActive: true },
  { key: 'wg2', name: 'Grupo Beta', description: 'Desc Beta', color: '#00ff00', isPrivate: false, memberKeys: [], isActive: true },
];

const mockTasks: Task[] = [];

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

// Mock Tooltip and other MUI components that might interfere
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ children, title }: any) => (
      <div data-testid="tooltip-mock" title={typeof title === 'string' ? title : 'complex-title'}>
        {children}
        <div data-testid="tooltip-content">{title}</div>
      </div>
    ),
  };
});

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetSnackbar = jest.fn();
const mockSetConfirmation = jest.fn();
const mockSetModal = jest.fn();
const mockSetIsLoading = jest.fn();

let mockAdminStatus = true;

jest.mock('../../../stores', () => ({
  useAuthStore: jest.fn((selector: Function) => selector({
    user: { key: 'admin', permissions: mockAdminStatus ? ['ADMIN'] : ['TYG'], workgroupKeys: ['wg1'] }
  })),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setSnackbar: mockSetSnackbar,
      setConfirmation: mockSetConfirmation,
      modal: { open: false },
      setModal: mockSetModal,
      setIsLoading: mockSetIsLoading,
    })
  ),
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector: Function) => selector({ workgroups: mockWorkgroups })),
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector: Function) => selector({ users: mockUsers })),
}));

jest.mock('../../../stores/tasks/tasks.store', () => ({
  useTasksStore: jest.fn((selector: Function) => selector({ tasks: mockTasks })),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/workgroup.service', () => ({
  WorkgroupService: {
    deleteWorkgroup: jest.fn().mockResolvedValue(true),
    deleteMemberFromWorkgroup: jest.fn().mockResolvedValue({ result: 'OK', message: 'Miembro eliminado' }),
  },
}));

// ─── Mocks de utils ──────────────────────────────────────────────────────────
jest.mock('../../../utils/utils', () => ({
  getUserNameByKey: jest.fn((key: string) => key === 'u1' ? 'Alice Smith' : 'Desconocido'),
}));

jest.mock('../../workgroups-form/WorkgroupsFormComponent', () => ({
  WorkgroupsFormComponent: () => <div data-testid="wg-form">WG Form</div>
}));

jest.mock('../../tasks-form/TasksFormComponent', () => ({
  TasksFormComponent: () => <div data-testid="task-form">Task Form</div>
}));

describe('WorkgroupsTableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminStatus = true;
  });

  test('debe renderizar todos los grupos para un admin', () => {
    render(<WorkgroupsTable />);
    expect(screen.getByText('Grupo Alpha')).toBeInTheDocument();
    expect(screen.getByText('Grupo Beta')).toBeInTheDocument();
  });

  test('debe filtrar grupos para un usuario no admin', () => {
    mockAdminStatus = false;
    render(<WorkgroupsTable />);
    expect(screen.getByText('Grupo Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Grupo Beta')).not.toBeInTheDocument();
  });

  test('debe mostrar icono de público cuando no hay miembros', () => {
    render(<WorkgroupsTable />);
    // Grupo Beta (wg2) no tiene miembros
    expect(screen.getByTitle('Público')).toBeInTheDocument();
  });

  test('debe abrir modal de nueva tarea', () => {
    render(<WorkgroupsTable />);
    fireEvent.click(screen.getAllByLabelText('Nueva tarea')[0]);
    expect(mockSetModal).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nueva Tarea' })
    );
  });

  test('debe abrir modal de modificar grupo', () => {
    render(<WorkgroupsTable />);
    fireEvent.click(screen.getAllByLabelText('Modificar')[0]);
    expect(mockSetModal).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Modificar Grupo de Trabajo' })
    );
  });

  test('debe abrir confirmación de eliminación', () => {
    render(<WorkgroupsTable />);
    fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);
    expect(mockSetConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Confirmacion!' })
    );
  });

  test('debe llamar a deleteWorkgroup al confirmar eliminación', async () => {
    const { WorkgroupService } = require('../../../services/workgroup.service');
    render(<WorkgroupsTable />);
    fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);

    const actionsJSX = (mockSetConfirmation as jest.Mock).mock.calls[0][0].actions;
    render(actionsJSX);
    
    // El último botón de eliminar es el que acabamos de renderizar desde actionsJSX
    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(WorkgroupService.deleteWorkgroup).toHaveBeenCalled();
    });
    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
  });

  test('debe fallar la eliminación si el servicio retorna false', async () => {
    const { WorkgroupService } = require('../../../services/workgroup.service');
    WorkgroupService.deleteWorkgroup.mockResolvedValueOnce(false);
    
    render(<WorkgroupsTable />);
    fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);

    const actionsJSX = (mockSetConfirmation as jest.Mock).mock.calls[0][0].actions;
    render(actionsJSX);
    
    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' })
      );
    });
  });

  test('debe permitir eliminar un miembro desde el tooltip', async () => {
    const { WorkgroupService } = require('../../../services/workgroup.service');
    render(<WorkgroupsTable />);
    
    // El tooltip mock renderiza el contenido directamente.
    // Chip de Alice Smith tiene un icono de eliminar
    const chipDeleteIcons = screen.getAllByTestId('CancelIcon'); 
    fireEvent.click(chipDeleteIcons[0]);

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(WorkgroupService.deleteMemberFromWorkgroup).toHaveBeenCalled();
    });
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
  });

  test('debe mostrar error al fallar eliminar miembro', async () => {
    const { WorkgroupService } = require('../../../services/workgroup.service');
    WorkgroupService.deleteMemberFromWorkgroup.mockResolvedValueOnce({ result: 'ERROR', errorMessage: 'Falla' });
    
    render(<WorkgroupsTable />);
    const chipDeleteIcons = screen.getAllByTestId('CancelIcon'); 
    fireEvent.click(chipDeleteIcons[0]);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', message: 'Falla' })
      );
    });
  });
});
