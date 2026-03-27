import { useWorkgroupStore } from '../workgroups.store';
import { Workgroup } from '../../../interfaces/Workgroup';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'wg-1': {
          key: 'wg1',
          name: 'Workgroup 1',
          isActive: true,
          isPrivate: false,
          color: '#4CAF50',
          memberKeys: ['user1', 'user2']
        }
      })
    });
    return jest.fn();
  })
}));

describe('Workgroups Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useWorkgroupStore.getState();
    expect(state.workgroups).toBeDefined();
    expect(Array.isArray(state.workgroups)).toBe(true);
  });

  test('debe establecer workgroups correctamente', () => {
    const mockWorkgroups: Workgroup[] = [
      {
        key: 'wg1',
        name: 'Test Group',
        isActive: true,
        isPrivate: false,
        color: '#4CAF50',
        memberKeys: ['user1']
      }
    ];
    
    useWorkgroupStore.getState().setWorkgroups(mockWorkgroups);
    expect(useWorkgroupStore.getState().workgroups).toEqual(mockWorkgroups);
  });

  test('debe establecer hasHydrated correctamente', () => {
    useWorkgroupStore.getState().setHasHydrated(true);
    expect(useWorkgroupStore.getState().hasHydrated).toBe(true);
  });
});
