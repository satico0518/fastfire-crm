import { UsersService } from '../users.service';
import { User } from '../../interfaces/User';

// Mock de Firebase
const mockRef = jest.fn();
const mockUpdate = jest.fn();

jest.mock('firebase/database', () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  update: (...args: unknown[]) => mockUpdate(...args)
}));

jest.mock('../../firebase/firebase.config', () => ({
  auth: {
    currentUser: { uid: 'current-user-uid' }
  },
  db: {}
}));

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUser', () => {
    test('debe eliminar usuario exitosamente (soft delete)', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const result = await UsersService.deleteUser('user-to-delete');

      expect(result.result).toBe('OK');
      expect(result.message).toContain('eliminado');
    });

    test('debe retornar error cuando falla la eliminación', async () => {
      mockUpdate.mockRejectedValue(new Error('Delete error'));

      const result = await UsersService.deleteUser('user-to-delete');

      expect(result.result).toBe('ERROR');
    });
  });

  describe('modifyUser', () => {
    test('debe modificar usuario exitosamente', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const userToModify: User = {
        key: 'user123',
        email: 'user@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: ['wg1']
      };

      const result = await UsersService.modifyUser(userToModify);

      expect(result.result).toBe('OK');
      expect(result.message).toContain('modificado');
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    test('debe retornar error cuando falla la modificación', async () => {
      mockUpdate.mockRejectedValue(new Error('Update error'));

      const userToModify: User = {
        key: 'user123',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: ['wg1']
      };

      const result = await UsersService.modifyUser(userToModify);

      expect(result.result).toBe('ERROR');
    });
  });

  describe('removeGroupKeyFromUsers', () => {
    test('debe remover workgroup key de múltiples usuarios', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const usersToUpdate: User[] = [
        {
          key: 'user1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          permissions: ['TYG'],
          workgroupKeys: ['wg1', 'wg2', 'wg3']
        },
        {
          key: 'user2',
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          isActive: true,
          permissions: ['ADMIN'],
          workgroupKeys: ['wg1', 'wg4']
        }
      ];

      const result = await UsersService.removeGroupKeyFromUsers(usersToUpdate, 'wg1');

      expect(result.result).toBe('OK');
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    test('debe retornar error cuando falla la remoción de grupo', async () => {
      mockUpdate.mockRejectedValue(new Error('Update error'));

      const usersToUpdate: User[] = [
        {
          key: 'user1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          permissions: ['TYG'],
          workgroupKeys: ['wg1', 'wg2']
        }
      ];

      const result = await UsersService.removeGroupKeyFromUsers(usersToUpdate, 'wg1');

      expect(result.result).toBe('ERROR');
    });
  });
});
