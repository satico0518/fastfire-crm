import { useFormatsStore } from '../formats.store';
import { onValue, ref } from 'firebase/database';

// Mock Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
}));

describe('FormatsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe cargar las sumisiones correctamente desde Firebase', () => {
    const mockData = {
      'sub1': { id: '1', createdDate: 1000, value: 'A' },
      'sub2': { id: '2', createdDate: 2000, value: 'B' },
    };

    // Mock onValue implementation to trigger the callback with mock data
    (onValue as jest.Mock).mockImplementation((_ref, callback) => {
      callback({
        val: () => mockData,
      });
      return jest.fn(); // Unsubscribe mock
    });

    const store = useFormatsStore.getState();
    store.loadSubmissions();

    const submissions = useFormatsStore.getState().submissions;
    expect(submissions).toHaveLength(2);
    // Verificar ordenamiento (más reciente b.createdDate - a.createdDate)
    expect(submissions[0].createdDate).toBe(2000);
    expect(submissions[1].createdDate).toBe(1000);
  });

  test('debe manejar datos vacíos correctamente', () => {
    (onValue as jest.Mock).mockImplementation((_ref, callback) => {
      callback({
        val: () => null,
      });
      return jest.fn();
    });

    const store = useFormatsStore.getState();
    store.loadSubmissions();

    expect(useFormatsStore.getState().submissions).toEqual([]);
  });

  test('debe capturar errores durante la carga', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (ref as jest.Mock).mockImplementation(() => {
      throw new Error('Firebase Error');
    });

    const store = useFormatsStore.getState();
    store.loadSubmissions();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
