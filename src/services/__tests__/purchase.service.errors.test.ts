import { PurchaseService } from '../purchase.service';
import { remove, set, update } from 'firebase/database';

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(() => ({ key: 'new-key' })),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../../firebase/firebase.config', () => ({ db: {} }));

describe('PurchaseService - caminos de error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('addItemToStock debe retornar ERROR cuando falla', async () => {
    (set as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await PurchaseService.addItemToStock({ key: '', name: 'Item' } as any);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('addStockFromExcel debe retornar ERROR cuando falla', async () => {
    (set as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await PurchaseService.addStockFromExcel([
      { codigo: 'C1', item: 'Item 1', valor: 100, licitar: 's', cantidad: 5 } as any
    ]);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('modifyItem debe retornar ERROR cuando falla', async () => {
    (update as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await PurchaseService.modifyItem({ key: 'k1', name: 'Item' } as any);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('deleteItem debe retornar ERROR cuando falla', async () => {
    (remove as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await PurchaseService.deleteItem({ key: 'k1' } as any);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('archiveItem debe retornar ERROR cuando falla', async () => {
    (update as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await PurchaseService.archiveItem({ key: 'k1' } as any);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('saveProviderLicitation debe retornar ERROR cuando falla', async () => {
    (set as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await PurchaseService.saveProviderLicitation({ providerKey: 'p1' } as any);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });
});
