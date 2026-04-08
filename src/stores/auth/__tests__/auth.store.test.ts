import { useAuthStore } from '../auth.store';
import { User, Access } from '../../../interfaces/User';

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useAuthStore.getState();
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
    
    useAuthStore.getState().setNewUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  test('debe establecer token correctamente', () => {
    useAuthStore.getState().setToken('test-token');
    expect(useAuthStore.getState().token).toBe('test-token');
  });

  test('debe establecer isAuth correctamente', () => {
    useAuthStore.getState().setIsAuth(true);
    expect(useAuthStore.getState().isAuth).toBe(true);
    
    useAuthStore.getState().setIsAuth(false);
    expect(useAuthStore.getState().isAuth).toBe(false);
  });

  test('debe establecer hasHydrated correctamente', () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });
});
