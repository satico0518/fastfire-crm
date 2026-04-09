import { useUsersStore } from '../users.store';
import { User } from '../../../interfaces/User';

// ─── Mock de Firebase ─────────────────────────────────────────────────────────
jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({ path: 'users' })),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'u1': {
          key: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com',
          isActive: true, permissions: ['ADMIN'], workgroupKeys: ['wg1'],
        },
        'u2': {
          key: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com',
          isActive: true, permissions: ['PROVIDER'], workgroupKeys: [],
        },
      }),
    });
    return jest.fn(); // unsubscribe
  }),
}));

// ─── Helper de usuario ────────────────────────────────────────────────────────
const buildUser = (overrides: Partial<User> = {}): User => ({
  key: 'u-test',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@test.com',
  isActive: true,
  permissions: ['TYG'],
  workgroupKeys: ['wg1'],
  ...overrides,
});

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('Users Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUsersStore.setState({ users: [], hasHydrated: false });
  });

  // ── Estado inicial ────────────────────────────────────────────────────────
  describe('estado inicial', () => {
    test('users debe ser un array definido', () => {
      const { users } = useUsersStore.getState();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });

    test('hasHydrated debe ser false inicialmente', () => {
      expect(useUsersStore.getState().hasHydrated).toBe(false);
    });

    test('debe exponer setUsers, setHasHydrated y loadUsers', () => {
      const state = useUsersStore.getState();
      expect(typeof state.setUsers).toBe('function');
      expect(typeof state.setHasHydrated).toBe('function');
      expect(typeof state.loadUsers).toBe('function');
    });
  });

  // ── setUsers ──────────────────────────────────────────────────────────────
  describe('setUsers', () => {
    test('debe reemplazar la lista de usuarios', () => {
      const newUsers = [buildUser(), buildUser({ key: 'u2', firstName: 'Bob' })];
      useUsersStore.getState().setUsers(newUsers);
      expect(useUsersStore.getState().users).toEqual(newUsers);
    });

    test('debe soportar array vacío', () => {
      useUsersStore.getState().setUsers([buildUser()]);
      useUsersStore.getState().setUsers([]);
      expect(useUsersStore.getState().users).toHaveLength(0);
    });

    test('debe mantener todos los campos del usuario', () => {
      const user = buildUser({ permissions: ['ADMIN', 'TYG'], workgroupKeys: ['wg1', 'wg2'] });
      useUsersStore.getState().setUsers([user]);
      const stored = useUsersStore.getState().users![0];
      expect(stored.permissions).toEqual(['ADMIN', 'TYG']);
      expect(stored.workgroupKeys).toEqual(['wg1', 'wg2']);
    });
  });

  // ── setHasHydrated ────────────────────────────────────────────────────────
  describe('setHasHydrated', () => {
    test('debe cambiar hasHydrated a true', () => {
      useUsersStore.getState().setHasHydrated(true);
      expect(useUsersStore.getState().hasHydrated).toBe(true);
    });

    test('debe poder resetear hasHydrated a false', () => {
      useUsersStore.getState().setHasHydrated(true);
      useUsersStore.getState().setHasHydrated(false);
      expect(useUsersStore.getState().hasHydrated).toBe(false);
    });
  });

  // ── loadUsers ─────────────────────────────────────────────────────────────
  describe('loadUsers', () => {
    test('debe llamar a onValue de Firebase', async () => {
      const { onValue } = require('firebase/database');
      await useUsersStore.getState().loadUsers();
      expect(onValue).toHaveBeenCalled();
    });

    test('debe cargar usuarios desde el snapshot de Firebase', async () => {
      await useUsersStore.getState().loadUsers();
      const { users } = useUsersStore.getState();
      expect(Array.isArray(users)).toBe(true);
      expect(users!.length).toBeGreaterThan(0);
    });

    test('debe manejar error de Firebase y dejar users como vacío', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { ref } = require('firebase/database');
      (ref as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Firebase connection error');
      });

      await useUsersStore.getState().loadUsers();

      expect(useUsersStore.getState().users).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
