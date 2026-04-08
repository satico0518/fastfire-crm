import { useTasksStore } from '../tasks.store';
import { Task } from '../../../interfaces/Task';

// ─── Mocks de Firebase ──────────────────────────────────────────────────────
const mockOnValueUnsubscribe = jest.fn();

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({ path: 'tasks' })),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'task-1': {
          id: '1', key: '1', name: 'Tarea 1', status: 'TODO',
          priority: 'LOW', createdDate: Date.now(), workgroupKeys: ['wg1'],
          workgroupKey: 'wg1', ownerKeys: ['user1'], tags: [], dueDate: '',
          notes: '', history: [], createdByUserKey: 'user1'
        },
        'task-2': {
          id: '2', key: '2', name: 'Tarea 2', status: 'IN_PROGRESS',
          priority: 'NORMAL', createdDate: Date.now(), workgroupKeys: ['wg1'],
          workgroupKey: 'wg1', ownerKeys: ['user2'], tags: [], dueDate: '',
          notes: '', history: [], createdByUserKey: 'user2'
        }
      })
    });
    return mockOnValueUnsubscribe;
  }),
}));

// ─── Datos de ayuda ─────────────────────────────────────────────────────────
const mockTask: Task = {
  id: '1', key: 'task-1', name: 'Tarea de prueba', status: 'TODO',
  priority: 'LOW', createdDate: Date.now(), workgroupKeys: ['wg1'],
  workgroupKey: 'wg1', ownerKeys: ['user1'], tags: [], dueDate: '',
  notes: '', history: [], createdByUserKey: 'user1', createdBy: 'user1',
  modifiedDate: Date.now(),
};

// ─── Suite ──────────────────────────────────────────────────────────────────
describe('Tasks Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear el store a su estado inicial entre tests
    useTasksStore.setState({ tasks: [], hasHydrated: false });
  });

  // ── Estado inicial ───────────────────────────────────────────────────────
  describe('estado inicial', () => {
    test('tasks debe ser un array definido', () => {
      const { tasks } = useTasksStore.getState();
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });

    test('hasHydrated debe ser false inicialmente', () => {
      expect(useTasksStore.getState().hasHydrated).toBe(false);
    });
  });

  // ── setTasks ─────────────────────────────────────────────────────────────
  describe('setTasks', () => {
    test('debe reemplazar las tareas con el nuevo array', () => {
      const tasks = [mockTask];
      useTasksStore.getState().setTasks(tasks);
      expect(useTasksStore.getState().tasks).toEqual(tasks);
    });

    test('debe soportar array vacío', () => {
      useTasksStore.getState().setTasks([mockTask]);
      useTasksStore.getState().setTasks([]);
      expect(useTasksStore.getState().tasks).toEqual([]);
    });

    test('debe soportar múltiples tareas', () => {
      const tasks: Task[] = [
        mockTask,
        { ...mockTask, id: '2', key: 'task-2', name: 'Tarea 2', status: 'DONE' },
        { ...mockTask, id: '3', key: 'task-3', name: 'Tarea 3', status: 'IN_PROGRESS' },
      ];
      useTasksStore.getState().setTasks(tasks);
      expect(useTasksStore.getState().tasks).toHaveLength(3);
      expect(useTasksStore.getState().tasks![0].name).toBe('Tarea de prueba');
    });
  });

  // ── setHasHydrated ───────────────────────────────────────────────────────
  describe('setHasHydrated', () => {
    test('debe cambiar hasHydrated a true', () => {
      useTasksStore.getState().setHasHydrated(true);
      expect(useTasksStore.getState().hasHydrated).toBe(true);
    });

    test('debe cambiar hasHydrated de true a false', () => {
      useTasksStore.getState().setHasHydrated(true);
      useTasksStore.getState().setHasHydrated(false);
      expect(useTasksStore.getState().hasHydrated).toBe(false);
    });
  });

  // ── loadTasks ─────────────────────────────────────────────────────────────
  describe('loadTasks', () => {
    test('debe llamar a onValue para suscribirse al stream de Firebase', async () => {
      const { onValue } = require('firebase/database');
      await useTasksStore.getState().loadTasks();
      expect(onValue).toHaveBeenCalled();
    });

    test('debe cargar tareas desde el snapshot de Firebase', async () => {
      await useTasksStore.getState().loadTasks();
      const { tasks } = useTasksStore.getState();
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks!.length).toBeGreaterThan(0);
    });

    test('debe manejar errores y dejar tasks como array vacío', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { ref } = require('firebase/database');
      (ref as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Firebase connection error');
      });

      await useTasksStore.getState().loadTasks();
      expect(useTasksStore.getState().tasks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
