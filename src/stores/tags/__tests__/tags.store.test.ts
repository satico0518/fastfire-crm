const mockRef = jest.fn();
const mockOnValue = jest.fn();

jest.mock('firebase/database', () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  onValue: (...args: unknown[]) => mockOnValue(...args),
}));

jest.mock('../../../firebase/firebase.config', () => ({
  db: {},
}));

const loadStore = () => {
  jest.resetModules();
  return require('../tags.store') as {
    useTagsStore: {
      getState: () => {
        tags: string[];
        loadTags: () => Promise<void>;
        setTags: (tags: string[]) => void;
      };
    };
  };
};

describe('Tags Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRef.mockReturnValue('tags-ref');
    mockOnValue.mockImplementation((_ref, callback) => {
      callback({
        val: () => ({
          'tag-1': 'tag1',
          'tag-2': 'tag2',
          'tag-3': 'tag3',
        }),
      });
      return jest.fn();
    });
  });

  test('debe tener estado inicial correcto', () => {
    const { useTagsStore } = loadStore();
    const state = useTagsStore.getState();

    expect(state.tags).toBeDefined();
    expect(Array.isArray(state.tags)).toBe(true);
  });

  test('debe establecer tags correctamente', () => {
    const { useTagsStore } = loadStore();
    const mockTags = ['tag1', 'tag2', 'tag3'];

    useTagsStore.getState().setTags(mockTags);
    expect(useTagsStore.getState().tags).toEqual(mockTags);
  });

  test('debe filtrar valores no string cuando carga etiquetas', async () => {
    mockOnValue.mockImplementation((_ref, callback) => {
      callback({
        val: () => ({
          ok1: 'tag-a',
          bad1: 123,
          ok2: 'tag-b',
          bad2: null,
        }),
      });
      return jest.fn();
    });

    const { useTagsStore } = loadStore();
    await useTagsStore.getState().loadTags();

    expect(useTagsStore.getState().tags).toEqual(['tag-a', 'tag-b']);
  });

  test('debe dejar tags vacio cuando snapshot no trae datos', async () => {
    mockOnValue.mockImplementation((_ref, callback) => {
      callback({ val: () => null });
      return jest.fn();
    });

    const { useTagsStore } = loadStore();
    await useTagsStore.getState().loadTags();

    expect(useTagsStore.getState().tags).toEqual([]);
  });

  test('debe manejar error del listener de Firebase', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockOnValue.mockImplementation((_ref, _callback, onError) => {
      onError(new Error('firebase-listener-error'));
      return jest.fn();
    });

    const { useTagsStore } = loadStore();
    await useTagsStore.getState().loadTags();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error cargando etiquetas desde Firebase',
      expect.objectContaining({ error: expect.any(Error) })
    );
    expect(useTagsStore.getState().tags).toEqual([]);

    consoleSpy.mockRestore();
  });

  test('debe manejar excepcion en loadTags', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRef.mockImplementation(() => {
      throw new Error('ref-crash');
    });

    const { useTagsStore } = loadStore();
    await useTagsStore.getState().loadTags();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error cargando etiquetas desde store',
      expect.objectContaining({ error: expect.any(Error) })
    );

    consoleSpy.mockRestore();
  });

  test('debe desuscribir listener previo al recargar', async () => {
    const unsubscribeFirst = jest.fn();
    const unsubscribeSecond = jest.fn();
    mockOnValue
      .mockImplementationOnce((_ref, callback) => {
        callback({ val: () => ({ a: 'tag-a' }) });
        return unsubscribeFirst;
      })
      .mockImplementationOnce((_ref, callback) => {
        callback({ val: () => ({ b: 'tag-b' }) });
        return unsubscribeSecond;
      });

    const { useTagsStore } = loadStore();
    await useTagsStore.getState().loadTags();

    expect(unsubscribeFirst).toHaveBeenCalledTimes(1);
  });
});
