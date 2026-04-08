import { TaskService } from '../task.service';
import { push, set, update, get, remove } from 'firebase/database';
import { Task } from '../../interfaces/Task';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../firebase/firebase.config', () => ({
  db: {}
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  remove: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('debe crear una tarea exitosamente', async () => {
      const mockTask: Partial<Task> = { name: 'Nueva Tarea' };
      (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
      (push as jest.Mock).mockReturnValue({ key: 'mock-key' });
      (set as jest.Mock).mockResolvedValue(undefined);

      const response = await TaskService.createTask(mockTask as Task, 'user1');

      expect(response.result).toBe('OK');
      expect(mockTask.id).toBe('mock-uuid');
      expect(mockTask.key).toBe('mock-key');
      expect(mockTask.status).toBe('TODO');
      expect(mockTask.createdByUserKey).toBe('user1');
      expect(set).toHaveBeenCalled();
    });

    it('debe manejar excepcion al crear tarea', async () => {
      (push as jest.Mock).mockImplementation(() => { throw new Error('DB Error'); });

      const response = await TaskService.createTask({} as Task);

      expect(response.result).toBe('ERROR');
      expect(response.errorMessage).toBe('Error tratando de crear Tarea');
    });

    it('debe agregar nota en historia si existe', async () => {
      const mockTask: Partial<Task> = { name: 'Tarea con nota', notes: ' initial note ' };
      (uuidv4 as jest.Mock).mockReturnValue('id');
      (push as jest.Mock).mockReturnValue({ key: 'key' });
      (set as jest.Mock).mockResolvedValue(undefined);

      await TaskService.createTask(mockTask as Task);

      expect(mockTask.history![0].note).toBe(' initial note ');
    });
  });

  describe('updateTask', () => {
    it('debe actualizar tarea modificando delta y añadir historia', async () => {
      const previousTask = {
        key: 'task1',
        name: 'Old Name',
        status: 'TODO',
        priority: 'NORMAL',
        history: []
      };

      (get as jest.Mock).mockResolvedValue({
        val: () => previousTask
      });
      (update as jest.Mock).mockResolvedValue(undefined);

      const updatedTask = {
        key: 'task1',
        name: 'New Name', // Changed
        status: 'DONE', // Changed
        priority: 'NORMAL', // Same
        notes: 'new note added', // Notes changed
        unknownField: undefined // should be ignored or normalized
      };

      const response = await TaskService.updateTask(updatedTask as any, 'user1');

      expect(response.result).toBe('OK');
      expect(update).toHaveBeenCalled();
      const payload = (update as jest.Mock).mock.calls[0][1];
      expect(payload.history.length).toBe(2); // NOTE_ADDED and UPDATED
      expect(payload.history[0].action).toBe('NOTE_ADDED');
      expect(payload.history[1].action).toBe('UPDATED');
      expect(payload.history[1].changes.length).toBe(2); // name and status
    });

    it('debe manejar error si get() falla o la tarea no existe', async () => {
      (get as jest.Mock).mockResolvedValue({ val: () => null });

      const response = await TaskService.updateTask({ key: 't1' } as any);

      expect(response.result).toBe('ERROR');
      expect(response.errorMessage).toBe('Tarea no encontrada.');
    });

    it('debe manejar excepcion durante la actualización', async () => {
      (get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const response = await TaskService.updateTask({ key: 't1' } as any);

      expect(response.result).toBe('ERROR');
      expect(response.errorMessage).toBe('Error al intentar editar la tarea.');
    });
    
    it('debe procesar arrays y objetos en la limpieza de datos', async () => {
      (get as jest.Mock).mockResolvedValue({ val: () => ({ key: 't1' }) });
      (update as jest.Mock).mockResolvedValue(undefined);

      await TaskService.updateTask({
        key: 't1',
        tags: ['a', undefined, 'b'],
        complex: { nested: undefined, valid: true } 
      } as any);

      const payload = (update as jest.Mock).mock.calls[0][1];
      expect(payload.tags).toEqual(['a', null, 'b']);
      expect(payload.complex).toEqual({ valid: true });
    });
  });

  describe('deleteTask', () => {
    it('debe eliminar logicamente actualizando el status a DELETED', async () => {
      (update as jest.Mock).mockResolvedValue(undefined);
      const response = await TaskService.deleteTask({ key: 't1' } as Task);
      expect(response.result).toBe('OK');
      expect(update).toHaveBeenCalledWith(undefined, expect.objectContaining({ status: 'DELETED' }));
    });

    it('debe manejar error en deleteTask', async () => {
      (update as jest.Mock).mockRejectedValue(new Error());
      const response = await TaskService.deleteTask({ key: 't1' } as Task);
      expect(response.result).toBe('ERROR');
    });
  });

  describe('physicalDeleteTask', () => {
    it('debe borrar fisicamente (remove)', async () => {
      (remove as jest.Mock).mockResolvedValue(undefined);
      const response = await TaskService.physicalDeleteTask({ key: 't1' } as Task);
      expect(response.result).toBe('OK');
      expect(remove).toHaveBeenCalled();
    });

    it('debe manejar error en physicalDeleteTask', async () => {
      (remove as jest.Mock).mockRejectedValue(new Error());
      const response = await TaskService.physicalDeleteTask({ key: 't1' } as Task);
      expect(response.result).toBe('ERROR');
    });
  });

  describe('removeGroupTasks', () => {
    it('debe borrar todas las tareas de una lista fisicamente', async () => {
      (remove as jest.Mock).mockResolvedValue(undefined);
      const response = await TaskService.removeGroupTasks([{ key: '1' }, { key: '2' }] as Task[]);
      expect(response.result).toBe('OK');
      expect(remove).toHaveBeenCalledTimes(2);
    });

    it('debe manejar error en removeGroupTasks', async () => {
      (remove as jest.Mock).mockRejectedValue(new Error());
      const response = await TaskService.removeGroupTasks([{ key: '1' }] as Task[]);
      expect(response.result).toBe('ERROR');
    });
  });

  describe('cleanupDeletedTasks', () => {
    it('debe borrar tareas que tengan > 30 dias eliminadas (status DELETED)', async () => {
      const now = Date.now();
      const thirtyOneDaysAgo = now - (31 * 24 * 60 * 60 * 1000);
      const tenDaysAgo = now - (10 * 24 * 60 * 60 * 1000);
      
      const mockData = {
        't1': { status: 'DELETED', deletedDate: thirtyOneDaysAgo }, // delete
        't2': { status: 'DELETED', deletedDate: tenDaysAgo }, // keep
        't3': { status: 'DONE' }, // keep
      };

      (get as jest.Mock).mockResolvedValue({ val: () => mockData });
      (remove as jest.Mock).mockResolvedValue(undefined);

      const response = await TaskService.cleanupDeletedTasks();

      expect(response.result).toBe('OK');
      // Should have deleted only t1
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('no hace nada si no hay datos', async () => {
      (get as jest.Mock).mockResolvedValue({ val: () => null });
      const response = await TaskService.cleanupDeletedTasks();
      expect(response.message).toBe('No tasks to cleanup');
    });

    it('debe manejar excepcion en cleanup', async () => {
      (get as jest.Mock).mockRejectedValue(new Error());
      const response = await TaskService.cleanupDeletedTasks();
      expect(response.result).toBe('ERROR');
    });
  });
});
