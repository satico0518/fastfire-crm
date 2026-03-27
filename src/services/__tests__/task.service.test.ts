import { TaskService } from '../task.service';
import { Task } from '../../interfaces/Task';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  push: jest.fn(() => ({ key: 'new-task-key' })),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(() => ({
    val: () => ({
      'task-1': {
        id: '1',
        key: '1',
        name: 'Tarea Test',
        status: 'TODO',
        priority: 'LOW',
        createdDate: Date.now()
      }
    })
  }))
}));

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe crear una tarea correctamente', async () => {
    const mockTask: Partial<Task> = {
      name: 'Nueva Tarea',
      status: 'TODO',
      priority: 'LOW'
    };

    const result = await TaskService.createTask(mockTask as Task);
    expect(result).toBeDefined();
  });

  test('debe actualizar una tarea correctamente', async () => {
    const mockTask: Partial<Task> = {
      id: '1',
      name: 'Tarea Actualizada',
      status: 'IN_PROGRESS'
    };

    const result = await TaskService.updateTask(mockTask as Task);
    expect(result).toBeDefined();
  });

  test('debe eliminar una tarea correctamente', async () => {
    const mockTask: Partial<Task> = {
      id: '1',
      key: '1',
      name: 'Tarea a eliminar',
      status: 'TODO',
      priority: 'LOW'
    };
    const result = await TaskService.deleteTask(mockTask as Task);
    expect(result).toBeDefined();
  });

  test('debe eliminar múltiples tareas correctamente', async () => {
    const mockTasks: Partial<Task>[] = [
      { id: '1', key: '1', name: 'Tarea 1', status: 'TODO', priority: 'LOW' },
      { id: '2', key: '2', name: 'Tarea 2', status: 'IN_PROGRESS', priority: 'NORMAL' }
    ];
    const result = await TaskService.removeGroupTasks(mockTasks as Task[]);
    expect(result).toBeDefined();
  });
});
