import { useTasksStore } from '../tasks.store';
import { Task } from '../../../interfaces/Task';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({
      val: () => ({
        'task-1': {
          id: '1',
          key: '1',
          name: 'Tarea 1',
          description: 'Descripción tarea 1',
          status: 'TODO',
          priority: 'LOW',
          createdDate: Date.now(),
          workgroupKeys: ['wg1'],
          workgroupKey: 'wg1',
          ownerKeys: ['user1'],
          tags: ['tag1'],
          dueDate: '',
          notes: '',
          history: [],
          createdByUserKey: 'user1'
        },
        'task-2': {
          id: '2',
          key: '2',
          name: 'Tarea 2',
          description: 'Descripción tarea 2',
          status: 'IN_PROGRESS',
          priority: 'NORMAL',
          createdDate: Date.now(),
          workgroupKeys: ['wg1'],
          workgroupKey: 'wg1',
          ownerKeys: ['user2'],
          tags: ['tag2'],
          dueDate: '',
          notes: '',
          history: [],
          createdByUserKey: 'user2'
        }
      })
    });
    return jest.fn();
  })
}));

describe('Tasks Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useTasksStore.getState();
    expect(state.tasks).toBeDefined();
    expect(Array.isArray(state.tasks)).toBe(true);
  });

  test('debe establecer tareas correctamente', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        key: '1',
        name: 'Tarea Test',
        description: 'Descripción test',
        status: 'TODO',
        priority: 'LOW',
        createdDate: Date.now(),
        workgroupKeys: ['wg1'],
        workgroupKey: 'wg1',
        ownerKeys: ['user1'],
        tags: [],
        dueDate: '',
        notes: '',
        history: [],
        createdByUserKey: 'user1'
      }
    ];
    
    useTasksStore.getState().setTasks(mockTasks);
    expect(useTasksStore.getState().tasks).toEqual(mockTasks);
  });

  test('debe establecer hasHydrated correctamente', () => {
    useTasksStore.getState().setHasHydrated(true);
    expect(useTasksStore.getState().hasHydrated).toBe(true);
    
    useTasksStore.getState().setHasHydrated(false);
    expect(useTasksStore.getState().hasHydrated).toBe(false);
  });
});
