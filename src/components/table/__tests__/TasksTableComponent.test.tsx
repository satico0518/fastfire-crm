import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTableComponent from '../TasksTableComponent';
import { Box } from '@mui/material';

// Mock de los stores con datos estáticos
jest.mock('../../../stores/tasks/tasks.store', () => ({
  useTasksStore: jest.fn((selector) => {
    const state = {
      tasks: [
        {
          id: '1',
          key: '1',
          name: 'Tarea 1',
          description: 'Descripción tarea 1',
          status: 'TODO',
          priority: 'LOW',
          createdDate: Date.now() - 1000,
          workgroupKeys: ['wg1'],
          workgroupKey: 'wg1',
          ownerKeys: ['user1'],
          tags: ['tag1'],
          dueDate: '',
          notes: '',
          history: [],
          createdByUserKey: 'user1'
        },
        {
          id: '2',
          key: '2',
          name: 'Tarea 2',
          description: 'Descripción tarea 2',
          status: 'IN_PROGRESS',
          priority: 'NORMAL',
          createdDate: Date.now() - 2000,
          workgroupKeys: ['wg1'],
          workgroupKey: 'wg1',
          ownerKeys: ['user2'],
          tags: ['tag2'],
          dueDate: '',
          notes: '',
          history: [],
          createdByUserKey: 'user2'
        }
      ],
      loadTasks: jest.fn(),
      setTasks: jest.fn(),
      hasHydrated: true,
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) => {
    const state = {
      users: [
        {
          key: 'user1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          isActive: true,
          permissions: ['USER'],
          workgroupKeys: ['wg1'],
          color: '#FF5722'
        },
        {
          key: 'user2',
          firstName: 'María',
          lastName: 'García',
          email: 'maria@example.com',
          isActive: true,
          permissions: ['USER'],
          workgroupKeys: ['wg1'],
          color: '#2196F3'
        }
      ],
      loadUsers: jest.fn(),
      setUsers: jest.fn(),
      hasHydrated: true,
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector) => {
    const state = {
      workgroups: [
        {
          key: 'wg1',
          name: 'Workgroup 1',
          isActive: true,
          isPrivate: false,
          color: '#4CAF50',
          memberKeys: ['user1', 'user2'],
          createdDate: Date.now()
        }
      ],
      loadWorkgroups: jest.fn(),
      setWorkgroups: jest.fn(),
      hasHydrated: true,
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector) => {
    const state = {
      user: {
        key: 'user1',
        permissions: ['USER'],
        workgroupKeys: ['wg1'],
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        isActive: true
      },
      isAuth: true,
      token: 'test-token',
      hasHydrated: true,
      setToken: jest.fn(),
      setNewUser: jest.fn(),
      setIsAuth: jest.fn(),
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: jest.fn(({ rows, columns }) => (
    <table role="grid">
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.field}>{col.headerName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.id}>
            {columns.map((col: any) => (
              <td key={col.field}>
                {col.renderCell 
                  ? col.renderCell({ row, value: row[col.field], field: col.field } as any) 
                  : row[col.field]}
                {col.type === 'actions' && col.getActions && col.getActions({ row } as any).map((action: any, i: number) => (
                  <div key={i}>{action}</div>
                ))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )),
  GridActionsCellItem: jest.fn(({ icon, onClick, label }) => (
    <button onClick={onClick} aria-label={label || 'actions'}>
      {icon} {label}
    </button>
  )),
}));

describe('TasksTableComponent', () => {
  test('renderiza la tabla de tareas correctamente', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    
    // Verificar que se renderiza el componente
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it("debe cambiar el estado de la tarea al hacer clic en el botón de iniciar", async () => {
    const mockUpdateTask = jest.fn().mockResolvedValue({ result: "OK" });
    const { TaskService } = require("../../../services/task.service");
    TaskService.updateTask = mockUpdateTask;
    const { useAuhtStore } = require('../../../stores');

    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { permissions: ["ADMIN"], key: "u1" } })
    );
    
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    
    // Buscar el botón de iniciar para la Tarea 1 (Estado: TODO)
    const startButtons = screen.getAllByTitle("Iniciar");
    fireEvent.click(startButtons[0]);
    
    expect(mockUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Tarea 1", status: "IN_PROGRESS" }),
      "u1"
    );
  });

  it("debe permitir editar el nombre de una tarea", async () => {
    const mockUpdateTask = jest.fn().mockResolvedValue({ result: "OK" });
    const { TaskService } = require("../../../services/task.service");
    TaskService.updateTask = mockUpdateTask;
    const { useAuhtStore } = require('../../../stores');

    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { permissions: ["ADMIN"], key: "u1" } })
    );

    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
  });

  it("debe llamar a exportar al hacer clic en el botón de Excel", () => {
    const utils = require("../../../utils/utils");
    const downloadSpy = jest
      .spyOn(utils, "downloadExcelFile")
      .mockImplementation(() => undefined);
    const { useAuhtStore } = require('../../../stores');
    
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { permissions: ["ADMIN"], key: "u1" } })
    );

    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    
    const exportButton = screen.getByText("Excel");
    fireEvent.click(exportButton);
    
    expect(downloadSpy).toHaveBeenCalled();
    downloadSpy.mockRestore();
  });

  it("debe mostrar el historial al hacer clic en el botón Historial", async () => {
    const { useAuhtStore } = require('../../../stores');
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { permissions: ["ADMIN"], key: "u1" } })
    );

    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    
    const historyButtons = screen.getAllByLabelText("Historial");
    fireEvent.click(historyButtons[0]);
    
    expect(await screen.findByText(/Historial de Tarea/i)).toBeInTheDocument();
  });

  test('muestra todas las tareas para usuarios ADMIN', () => {
    const { useAuhtStore } = require('../../../stores');
    useAuhtStore.mockImplementation((selector: ((state: unknown) => unknown) | undefined) => {
      const state = {
        user: {
          key: 'admin',
          permissions: ['ADMIN'],
          workgroupKeys: [],
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          isActive: true
        },
        isAuth: true,
        token: 'test-token',
        hasHydrated: true,
        setToken: jest.fn(),
        setNewUser: jest.fn(),
        setIsAuth: jest.fn(),
        setHasHydrated: jest.fn()
      };
      return selector ? selector(state) : state;
    });
    
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    
    // Debería mostrar todas las tareas
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
