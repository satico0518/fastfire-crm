import { useUsersStore } from '../users.store';
import { User, Access } from '../../../interfaces/User';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'user-1': {
          key: 'user1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          isActive: true,
          permissions: ['TYG'],
          workgroupKeys: ['wg1'],
          color: '#FF5722'
        },
        'user-2': {
          key: 'user2',
          firstName: 'María',
          lastName: 'García',
          email: 'maria@example.com',
          isActive: true,
          permissions: ['TYG', 'ADMIN'],
          workgroupKeys: ['wg1', 'wg2'],
          color: '#2196F3'
        }
      })
    });
    return jest.fn();
  })
}));

describe('Users Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useUsersStore.getState();
    expect(state.users).toBeDefined();
    expect(Array.isArray(state.users)).toBe(true);
  });

  test('debe establecer usuarios correctamente', () => {
    const mockUsers: User[] = [
      {
        key: 'user1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        isActive: true,
        permissions: ['TYG' as Access],
        workgroupKeys: ['wg1'],
        color: '#FF5722'
      }
    ];
    
    useUsersStore.getState().setUsers(mockUsers);
    expect(useUsersStore.getState().users).toEqual(mockUsers);
  });

  test('debe establecer hasHydrated correctamente', () => {
    useUsersStore.getState().setHasHydrated(true);
    expect(useUsersStore.getState().hasHydrated).toBe(true);
  });
});
