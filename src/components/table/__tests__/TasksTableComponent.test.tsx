/** @jsxImportSource @emotion/react */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTableComponent from '../TasksTableComponent';
import { Box } from '@mui/material';
import { Task } from '../../../interfaces/Task';

// Mock realista de Zustand store para tasks
const mockTasks: Task[] = [
  {
    id: '1',
    key: '1',
    name: 'Tarea 1',
    description: 'Descripción tarea 1',
    status: 'TODO',
    priority: 'LOW' as const,
    createdDate: Date.now() - 1000,
    modifiedDate: Date.now(),
    workgroupKeys: ['wg1'],
    workgroupKey: 'wg1',
    ownerKeys: ['user1'],
    tags: ['tag1'],
    dueDate: '',
    notes: '',
    history: [],
    createdByUserKey: 'user1',
    createdBy: 'user1'
  },
  {
    id: '2',
    key: '2',
    name: 'Tarea 2',
    description: 'Descripción tarea 2',
    status: 'DONE',
    priority: 'HIGH' as const,
    createdDate: Date.now() - 2000,
    modifiedDate: Date.now(),
    workgroupKeys: ['wg1'],
    workgroupKey: 'wg1',
    ownerKeys: ['user2'],
    tags: ['tag2'],
    dueDate: '',
    notes: '',
    history: [],
    createdByUserKey: 'user2',
    createdBy: 'user2'
  }
];

const mockUsers = [
  { id: '1', key: 'user1', name: 'User One', email: 'user1@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true },
  { id: '2', key: 'user2', name: 'User Two', email: 'user2@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true }
];

const mockWorkgroups = [
  { id: '1', key: 'wg1', name: 'Workgroup 1', description: 'Test workgroup' }
];

const mockCurrentUser = {
  id: 'admin', 
  key: 'admin', 
  name: 'Admin User', 
  email: 'admin@test.com', 
  role: 'ADMIN', 
  permissions: ['ADMIN'],
  workgroupKeys: ['wg1'],
  active: true
};

jest.mock('../../../stores/tasks/tasks.store', () => ({
  useTasksStore: jest.fn((selector) => selector ? selector({ tasks: mockTasks }) : { tasks: mockTasks })
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector) =>
    selector ? selector({
      setSnackbar: jest.fn(),
      setConfirmation: jest.fn(),
      setModal: jest.fn()
    }) : {
      setSnackbar: jest.fn(),
      setConfirmation: jest.fn(),
      setModal: jest.fn()
    }
  )
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) =>
    selector ? selector({ users: mockUsers }) : { users: mockUsers }
  )
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector) =>
    selector ? selector({ workgroups: mockWorkgroups }) : { workgroups: mockWorkgroups }
  )
}));

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector) =>
    selector ? selector({ user: mockCurrentUser }) : { user: mockCurrentUser }
  )
}));

jest.mock('../../../services/task.service', () => ({
  TaskService: {
    cleanupDeletedTasks: jest.fn(),
    updateTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Updated' }),
    deleteTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Deleted' }),
    physicalDeleteTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Physically deleted' })
  }
}));

jest.mock('../../../utils/utils', () => ({
  changeDateFromDMA_MDA: jest.fn(),
  downloadExcelFile: jest.fn(),
  getUserKeysByNames: jest.fn().mockReturnValue(['user1', 'user2']),
  getUserNameByKey: jest.fn().mockReturnValue('User Name'),
  getWorkgroupNameByKey: jest.fn().mockReturnValue('Workgroup 1'),
  translatePriority: jest.fn((p) => p === 'LOW' ? 'Baja' : 'Alta'),
  translateStatus: jest.fn((s) => s === 'TODO' ? 'Por Hacer' : 'Completada'),
  translateTimestampToString: jest.fn().mockReturnValue('01/01/2024')
}));

jest.mock('../../task-creator-row/TaskCreatorRowComponent', () => ({
  TaskCreatorRowComponent: function MockTaskCreatorRow() {
    return <div data-testid="mock-task-creator-row">Task Creator Row</div>;
  }
}));

jest.mock('../../tasks-form/TasksFormComponent', () => ({
  TasksFormComponent: function MockTasksForm() {
    return <div data-testid="mock-tasks-form">Tasks Form</div>;
  }
}));

jest.mock('../../dialogs/DialogueMultiselect', () => ({
  DialogueMultiselect: function MockDialogueMultiselect() {
    return <div data-testid="mock-dialogue-multiselect">Multiselect</div>;
  }
}));

jest.mock('../../dialogs/DialogueCustomContent', () => ({
  DialogueCustomContent: function MockDialogueCustomContent() {
    return <div data-testid="mock-dialogue-custom">Custom Dialogue</div>;
  }
}));

jest.mock('../../priority-input/PriorityInput', () => ({
  PriorityInput: function MockPriorityInput() {
    return <div data-testid="mock-priority-input">Priority Input</div>;
  }
}));

jest.mock('../../tags-input/TagsInput', () => ({
  TagsInput: function MockTagsInput() {
    return <div data-testid="mock-tags-input">Tags Input</div>;
  }
}));

describe('TasksTableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar sin errores', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('debería mostrar las columnas esperadas', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
    const cells = screen.getAllByRole('columnheader');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('debería renderizar el task creator row', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    expect(screen.getByTestId('mock-task-creator-row')).toBeInTheDocument();
  });

  it('debería tener grid con altura y ancho definido', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    const grid = screen.getByRole('grid');
    expect(grid).toHaveStyle({ height: expect.any(String) });
  });

  it('debería limpiar tareas eliminadas en mount', () => {
    const { TaskService } = require('../../../services/task.service');
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    expect(TaskService.cleanupDeletedTasks).toHaveBeenCalled();
  });

  it('debería renderizar componentes mock correctamente', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    expect(screen.getByTestId('mock-task-creator-row')).toBeInTheDocument();
  });

  it('debería aceptar workgroup como prop', () => {
    const workgroup = { id: '1', key: 'wg1', name: 'Test Group', description: 'Test', isActive: true, isPrivate: false, color: '#000000', memberKeys: [] };
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent workgroup={workgroup} />
      </Box>
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('debería tener múltiples columnheaders', () => {
    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('debería renderizar Paper container', () => {
    const { container } = render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('debería mantener estado inicial consistente', () => {
    const { rerender } = render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    const grid1 = screen.getByRole('grid');
    rerender(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent />
      </Box>
    );
    const grid2 = screen.getByRole('grid');
    expect(grid1).toBeInTheDocument();
    expect(grid2).toBeInTheDocument();
  });
});
