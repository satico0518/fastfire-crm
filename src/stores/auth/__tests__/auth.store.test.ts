import { useAuhtStore } from '../auth.store';
import { User, Access } from '../../../interfaces/User';

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useAuhtStore.getState();
    expect(state.user).toBeDefined();
    expect(state.isAuth).toBeDefined();
    expect(state.token).toBeDefined();
    expect(state.hasHydrated).toBeDefined();
  });

  test('debe establecer usuario correctamente', () => {
    const mockUser: User = {
      key: 'user1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      isActive: true,
      permissions: ['TYG' as Access],
      workgroupKeys: ['wg1']
    };
    
    useAuhtStore.getState().setNewUser(mockUser);
    expect(useAuhtStore.getState().user).toEqual(mockUser);
  });

  test('debe establecer token correctamente', () => {
    useAuhtStore.getState().setToken('test-token');
    expect(useAuhtStore.getState().token).toBe('test-token');
  });

  test('debe establecer isAuth correctamente', () => {
    useAuhtStore.getState().setIsAuth(true);
    expect(useAuhtStore.getState().isAuth).toBe(true);
    
    useAuhtStore.getState().setIsAuth(false);
    expect(useAuhtStore.getState().isAuth).toBe(false);
  });

  test('debe establecer hasHydrated correctamente', () => {
    useAuhtStore.getState().setHasHydrated(true);
    expect(useAuhtStore.getState().hasHydrated).toBe(true);
  });
});
