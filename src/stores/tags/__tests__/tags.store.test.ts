import { useTagsStore } from '../tags.store';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'tag-1': 'tag1',
        'tag-2': 'tag2',
        'tag-3': 'tag3'
      })
    });
    return jest.fn();
  })
}));

describe('Tags Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useTagsStore.getState();
    expect(state.tags).toBeDefined();
    expect(Array.isArray(state.tags)).toBe(true);
  });

  test('debe establecer tags correctamente', () => {
    const mockTags = ['tag1', 'tag2', 'tag3'];
    useTagsStore.getState().setTags(mockTags);
    expect(useTagsStore.getState().tags).toEqual(mockTags);
  });
});
