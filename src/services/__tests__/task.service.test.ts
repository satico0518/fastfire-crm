import { TaskService } from '../task.service';
import { Task } from '../../interfaces/Task';
import * as Firebase from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

// Mock Firebase
jest.mock('firebase/database');

const mockSnapshot = (data: any) => ({
  val: () => data,
  exists: () => data !== null,
});

describe('TaskService', () => {
  const mockTask: Partial<Task> = {
    key: 'task-1',
    id: '1',
    name: 'Test Task',
    status: 'TODO',
    priority: 'NORMAL',
    createdByUserKey: 'user-1',
    createdDate: Date.now(),
    notes: 'Old Notes',
    history: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Firebase.getDatabase as jest.Mock).mockReturnValue({});
    (Firebase.ref as jest.Mock).mockReturnValue({ path: 'test-path' });
    (Firebase.push as jest.Mock).mockReturnValue({ key: 'new-key', path: 'new-path' });
    (Firebase.set as jest.Mock).mockResolvedValue(undefined);
    (Firebase.update as jest.Mock).mockResolvedValue(undefined);
    (Firebase.get as jest.Mock).mockResolvedValue(mockSnapshot(null));
    (Firebase.remove as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createTask', () => {
    test('debe crear una tarea correctamente y generar ID', async () => {
      const taskInput: Partial<Task> = { name: 'New Task', notes: 'Something' };
      const result = await TaskService.createTask(taskInput as Task, 'creator-1');
      
      expect(result.result).toBe('OK');
      expect(uuidv4).toHaveBeenCalled();
      expect(Firebase.set).toHaveBeenCalled();
      
      const savedTask = (Firebase.set as jest.Mock).mock.calls[0][1];
      expect(savedTask.id).toBe('test-uuid');
      expect(savedTask.status).toBe('TODO');
      expect(savedTask.history).toHaveLength(1);
      expect(savedTask.history[0].action).toBe('CREATED');
      expect(savedTask.history[0].note).toBe('Something');
    });

    test('debe manejar error al crear tarea', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Firebase.set as jest.Mock).mockRejectedValue(new Error('Firebase Error'));
      
      const result = await TaskService.createTask({} as Task);
      expect(result.result).toBe('ERROR');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('updateTask', () => {
    test('debe actualizar tarea encontrando diferencias y agregando notas', async () => {
      (Firebase.get as jest.Mock).mockResolvedValue(mockSnapshot(mockTask));
      
      const updatedTask: Partial<Task> = {
        ...mockTask,
        name: 'Updated Name',
        notes: 'Old Notes and New Part',
        status: 'IN_PROGRESS'
      };

      const result = await TaskService.updateTask(updatedTask as Task, 'modifier-1');
      
      expect(result.result).toBe('OK');
      const payload = (Firebase.update as jest.Mock).mock.calls[0][1];
      
      expect(payload.name).toBe('Updated Name');
      expect(payload.history).toHaveLength(2); // UPDATED and NOTE_ADDED
      expect(payload.history[0].action).toBe('NOTE_ADDED');
      expect(payload.history[0].note).toBe('and New Part');
    });

    test('debe retornar ERROR si tarea no existe', async () => {
      (Firebase.get as jest.Mock).mockResolvedValue(mockSnapshot(null));
      const result = await TaskService.updateTask({ key: 'none' } as Task);
      expect(result.result).toBe('ERROR');
      expect(result.errorMessage).toBe('Tarea no encontrada.');
    });

    test('debe manejar error al actualizar', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Firebase.get as jest.Mock).mockRejectedValue(new Error('DB Error'));
      
      const result = await TaskService.updateTask(mockTask as Task);
      expect(result.result).toBe('ERROR');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('debe truncar historial a 20 elementos', async () => {
      const longHistory = Array(25).fill({ action: 'TEST' });
      (Firebase.get as jest.Mock).mockResolvedValue(mockSnapshot({ ...mockTask, history: longHistory }));
      
      const updatedTask = { ...mockTask, name: 'Changed' };
      await TaskService.updateTask(updatedTask as Task);
      
      const payload = (Firebase.update as jest.Mock).mock.calls[0][1];
      expect(payload.history).toHaveLength(20);
    });
  });

  describe('deleteTask', () => {
    test('debe marcar tarea como DELETED', async () => {
      const result = await TaskService.deleteTask(mockTask as Task);
      expect(result.result).toBe('OK');
      expect(Firebase.update).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        status: 'DELETED'
      }));
    });

    test('debe manejar error en eliminación lógica', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Firebase.update as jest.Mock).mockRejectedValue(new Error('Fail'));
      const result = await TaskService.deleteTask(mockTask as Task);
      expect(result.result).toBe('ERROR');
      consoleSpy.mockRestore();
    });
  });

  describe('physicalDeleteTask', () => {
    test('debe remover tarea permanentemente', async () => {
      const result = await TaskService.physicalDeleteTask(mockTask as Task);
      expect(result.result).toBe('OK');
      expect(Firebase.remove).toHaveBeenCalled();
    });

    test('debe manejar error en eliminación física', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Firebase.remove as jest.Mock).mockRejectedValue(new Error('Fail'));
      const result = await TaskService.physicalDeleteTask(mockTask as Task);
      expect(result.result).toBe('ERROR');
      consoleSpy.mockRestore();
    });
  });

  describe('removeGroupTasks', () => {
    test('debe eliminar múltiples tareas permanentemente', async () => {
      const tasks = [mockTask as Task, { ...mockTask, key: '2' } as Task];
      const result = await TaskService.removeGroupTasks(tasks);
      expect(result).toEqual({
        result: 'OK',
        message: 'Tareas eliminadas exitosamente!'
      });
      expect(Firebase.remove).toHaveBeenCalledTimes(2);
    });

    test('debe manejar error en eliminación de grupo', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Firebase.remove as jest.Mock).mockRejectedValue(new Error('Fail'));
      const result = await TaskService.removeGroupTasks([mockTask as Task]);
      expect(result.result).toBe('ERROR');
      consoleSpy.mockRestore();
    });
  });

  describe('cleanupDeletedTasks', () => {
    test('debe limpiar tareas eleminadas de hace más de 30 días', async () => {
      const oldDate = Date.now() - (35 * 24 * 60 * 60 * 1000); // 35 dias
      const recentDate = Date.now() - (5 * 24 * 60 * 60 * 1000); // 5 dias
      
      const tasksData = {
        'old': { status: 'DELETED', deletedDate: oldDate },
        'recent': { status: 'DELETED', deletedDate: recentDate },
        'active': { status: 'TODO', deletedDate: oldDate }
      };

      (Firebase.get as jest.Mock).mockResolvedValue(mockSnapshot(tasksData));
      
      const result = await TaskService.cleanupDeletedTasks();
      expect(result.result).toBe('OK');
      // Solo debe haber llamado a remove para 'old'
      expect(Firebase.remove).toHaveBeenCalledTimes(1);
    });

    test('debe manejar caso sin tareas para limpiar', async () => {
      (Firebase.get as jest.Mock).mockResolvedValue(mockSnapshot(null));
      const result = await TaskService.cleanupDeletedTasks();
      expect(result.result).toBe('OK');
      expect(result.message).toBe('No tasks to cleanup');
    });

    test('debe manejar error en limpieza', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Firebase.get as jest.Mock).mockRejectedValue(new Error('Fail'));
      const result = await TaskService.cleanupDeletedTasks();
      expect(result.result).toBe('ERROR');
      consoleSpy.mockRestore();
    });
  });
});

