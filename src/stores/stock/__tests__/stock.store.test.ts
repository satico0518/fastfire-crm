import { useStockStore } from '../stock.store';
import { Item } from '../../../interfaces/Item';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'stock-1': {
          key: 'stock1',
          description: 'Item Test',
          quantity: 10
        }
      })
    });
    return jest.fn();
  })
}));

describe('Stock Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStockStore.setState({ stock: [] });
  });

  test('debe tener estado inicial correcto', () => {
    const state = useStockStore.getState();
    expect(state.stock).toBeDefined();
    expect(Array.isArray(state.stock)).toBe(true);
  });

  test('debe establecer stock correctamente', () => {
    const mockStock: Item[] = [
      {
        id: 'item1',
        key: 'stock1',
        name: 'Item Test',
        price: 1000,
        showInTender: true,
        status: 'ACTIVE',
        count: 10
      }
    ];
    useStockStore.getState().setStock(mockStock);
    expect(useStockStore.getState().stock).toEqual(mockStock);
  });

  test('debe dejar stock vacío cuando snapshot no es objeto válido', async () => {
    const { onValue } = require('firebase/database');
    (onValue as jest.Mock).mockImplementationOnce((_ref, callback) => {
      callback({ val: () => null });
      return jest.fn();
    });

    await useStockStore.getState().loadStock();
    expect(useStockStore.getState().stock).toEqual([]);
  });

  test('debe manejar errores de carga y loguear en consola', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { ref } = require('firebase/database');
    (ref as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Firebase stock error');
    });

    await useStockStore.getState().loadStock();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error cargando inventario desde store',
      expect.objectContaining({ error: expect.any(Error) })
    );
    consoleSpy.mockRestore();
  });
});
