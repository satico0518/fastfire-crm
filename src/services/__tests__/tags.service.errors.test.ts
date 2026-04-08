import { TagsService } from '../tags.service';
import { remove, set, update } from 'firebase/database';

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(() => ({ key: 'new-tag-key' })),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../../firebase/firebase.config', () => ({ db: {} }));

describe('TagsService - caminos de error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('createTag debe retornar ERROR cuando falla', async () => {
    (set as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await TagsService.createTag('etiqueta-fallida');
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('updateTags debe retornar ERROR cuando falla', async () => {
    (update as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await TagsService.updateTags(['tag1', 'tag2']);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });

  test('deleteTagByKey debe retornar ERROR cuando falla', async () => {
    (remove as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    const result = await TagsService.deleteTagByKey('key-fallido');
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeTruthy();
  });
});
