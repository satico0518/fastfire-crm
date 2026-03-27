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
});
