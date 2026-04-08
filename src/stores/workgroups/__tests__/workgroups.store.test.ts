import { useWorkgroupStore } from '../workgroups.store';
import { Workgroup } from '../../../interfaces/Workgroup';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

const { ref: mockRef, onValue: mockOnValue } = jest.requireMock('firebase/database') as {
  ref: jest.Mock;
  onValue: jest.Mock;
};

describe('Workgroups Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWorkgroupStore.setState({ workgroups: [], hasHydrated: false });

    mockRef.mockReturnValue('mock-workgroups-ref');
    mockOnValue.mockImplementation((_ref: unknown, callback: (snapshot: { val: () => Record<string, Workgroup> | null }) => void) => {
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
    });
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

  test('loadWorkgroups carga datos desde firebase', async () => {
    await useWorkgroupStore.getState().loadWorkgroups();

    expect(mockRef).toHaveBeenCalled();
    expect(mockOnValue).toHaveBeenCalled();
    expect(useWorkgroupStore.getState().workgroups).toEqual([
      {
        key: 'wg1',
        name: 'Workgroup 1',
        isActive: true,
        isPrivate: false,
        color: '#4CAF50',
        memberKeys: ['user1', 'user2']
      }
    ]);
  });

  test('loadWorkgroups deja arreglo vacío cuando snapshot es null', async () => {
    mockOnValue.mockImplementationOnce((_ref: unknown, callback: (snapshot: { val: () => null }) => void) => {
      callback({ val: () => null });
      return jest.fn();
    });

    await useWorkgroupStore.getState().loadWorkgroups();

    expect(useWorkgroupStore.getState().workgroups).toEqual([]);
  });

  test('loadWorkgroups maneja errores y limpia estado', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRef.mockImplementationOnce(() => {
      throw new Error('firebase-ref-error');
    });

    await useWorkgroupStore.getState().loadWorkgroups();

    expect(errorSpy).toHaveBeenCalled();
    expect(useWorkgroupStore.getState().workgroups).toEqual([]);
    errorSpy.mockRestore();
  });
});
