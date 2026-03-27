import { TagsService } from '../tags.service';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  push: jest.fn(() => ({ key: 'new-tag-key' })),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}));

describe('TagsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe crear una etiqueta correctamente', async () => {
    const result = await TagsService.createTag('nueva-etiqueta');
    expect(result).toBeDefined();
    expect(result.result).toBe('OK');
  });

  test('debe actualizar etiquetas correctamente', async () => {
    const tags = ['tag1', 'tag2', 'tag3'];
    const result = await TagsService.updateTags(tags);
    expect(result).toBeDefined();
    expect(result.result).toBe('OK');
  });

  test('debe eliminar una etiqueta por key correctamente', async () => {
    const result = await TagsService.deleteTagByKey('tag-key-1');
    expect(result).toBeDefined();
    expect(result.result).toBe('OK');
  });
});
