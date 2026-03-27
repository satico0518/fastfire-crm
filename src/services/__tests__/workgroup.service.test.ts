import { WorkgroupService } from '../workgroup.service';
import { Workgroup } from '../../interfaces/Workgroup';
import { User } from '../../interfaces/User';
import { Task } from '../../interfaces/Task';

// Mock de Firebase
const mockRef = jest.fn();
const mockPush = jest.fn(() => ({ key: 'new-wg-key' }));
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockGet = jest.fn();

jest.mock('firebase/database', () => ({
  ref: (...args: unknown[]) => mockRef.apply(null, args as unknown[]),
  push: (...args: unknown[]) => mockPush.apply(null, args as unknown[]),
  set: (...args: unknown[]) => mockSet.apply(null, args as unknown[]),
  update: (...args: unknown[]) => mockUpdate.apply(null, args as unknown[]),
  get: (...args: unknown[]) => mockGet.apply(null, args as unknown[])
}));

jest.mock('../../firebase/firebase.config', () => ({
  db: {}
}));

// Mock de TaskService y UsersService
jest.mock('../task.service', () => ({
  TaskService: {
    removeGroupTasks: jest.fn().mockResolvedValue({ result: 'OK' })
  }
}));

jest.mock('../users.service', () => ({
  UsersService: {
    removeGroupKeyFromUsers: jest.fn().mockResolvedValue({ result: 'OK' })
  }
}));

describe('WorkgroupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkgroup', () => {
    test('debe crear workgroup exitosamente', async () => {
      mockSet.mockResolvedValue(undefined);
      mockUpdate.mockResolvedValue(undefined);

      const mockUsers: User[] = [
        {
          key: 'user1',
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          permissions: ['TYG'],
          workgroupKeys: []
        }
      ];

      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: ['user1']
      };

      const result = await WorkgroupService.createWorkgroup(mockWorkgroup, mockUsers);

      expect(result).toBeDefined();
    });

    test('debe retornar error cuando falla la creación', async () => {
      mockSet.mockRejectedValue(new Error('Create error'));

      const mockUsers: User[] = [];
      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: []
      };

      const result = await WorkgroupService.createWorkgroup(mockWorkgroup, mockUsers);

      expect(result.result).toBe('ERROR');
    });
  });

  describe('getWorkgroups', () => {
    test('debe obtener workgroups exitosamente', async () => {
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({
          'wg-1': {
            key: 'wg1',
            name: 'Group 1',
            isActive: true,
            isPrivate: false,
            color: '#FF5722',
            memberKeys: ['user1']
          }
        })
      });

      const result = await WorkgroupService.getWorkgroups();

      expect(Array.isArray(result)).toBe(true);
    });

    test('debe retornar array vacío cuando no hay datos', async () => {
      mockGet.mockResolvedValue({
        exists: () => false,
        val: () => null
      });

      const result = await WorkgroupService.getWorkgroups();

      expect(result).toEqual([]);
    });
  });

  describe('modifyWorkgroup', () => {
    test('debe modificar workgroup exitosamente', async () => {
      mockUpdate.mockResolvedValue(undefined);
      mockSet.mockResolvedValue(undefined);

      const mockUsers: User[] = [
        {
          key: 'user1',
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          permissions: ['TYG'],
          workgroupKeys: ['wg1']
        }
      ];

      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Updated Group',
        isActive: true,
        isPrivate: false,
        color: '#2196F3',
        memberKeys: ['user1']
      };

      const result = await WorkgroupService.modifyWorkgroup(mockWorkgroup, mockUsers);

      expect(result.result).toBe('OK');
      expect(result.message).toContain('modificado');
    });

    test('debe retornar error cuando falla la modificación', async () => {
      mockUpdate.mockRejectedValue(new Error('Update error'));

      const mockUsers: User[] = [];
      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: []
      };

      const result = await WorkgroupService.modifyWorkgroup(mockWorkgroup, mockUsers);

      expect(result.result).toBe('ERROR');
    });
  });

  describe('deleteWorkgroup', () => {
    test('debe eliminar workgroup exitosamente', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const mockUsers: User[] = [
        {
          key: 'user1',
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          permissions: ['TYG'],
          workgroupKeys: ['wg1']
        }
      ];

      const mockTasks = [] as any;

      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: ['user1']
      };

      const result = await WorkgroupService.deleteWorkgroup(mockWorkgroup, mockTasks, mockUsers);

      expect(result).toBeDefined();
    });

    test('debe retornar error cuando falla la eliminación', async () => {
      mockUpdate.mockRejectedValue(new Error('Delete error'));

      const mockUsers: User[] = [];
      const mockTasks: Task[] = [];
      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: []
      };

      const result = await WorkgroupService.deleteWorkgroup(mockWorkgroup, mockTasks, mockUsers);

      expect(result.result).toBe('ERROR');
    });
  });

  describe('deleteMemberFromWorkgroup', () => {
    test('debe eliminar miembro exitosamente', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: ['user1', 'user2']
      };

      const result = await WorkgroupService.deleteMemberFromWorkgroup(mockWorkgroup, 'user1');

      expect(result.result).toBe('OK');
      expect(result.message).toContain('removido');
    });

    test('debe retornar error cuando falla la eliminación', async () => {
      mockUpdate.mockRejectedValue(new Error('Delete error'));

      const mockWorkgroup: Workgroup = {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: ['user1']
      };

      const result = await WorkgroupService.deleteMemberFromWorkgroup(mockWorkgroup, 'user1');

      expect(result).toBeDefined();
    });
  });
});
