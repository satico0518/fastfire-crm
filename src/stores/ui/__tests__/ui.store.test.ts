import { useUiStore } from '../ui.store';

describe('UI Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useUiStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.modal).toBeDefined();
    expect(state.snackbar).toBeDefined();
    expect(state.confirmation).toBeDefined();
    expect(state.isSidebarCollapsed).toBe(false);
  });

  test('debe establecer isLoading correctamente', () => {
    useUiStore.getState().setIsLoading(true);
    expect(useUiStore.getState().isLoading).toBe(true);
    
    useUiStore.getState().setIsLoading(false);
    expect(useUiStore.getState().isLoading).toBe(false);
  });

  test('debe establecer modal correctamente', () => {
    const mockModal = { open: true, title: 'Test Modal', content: null };
    useUiStore.getState().setModal(mockModal);
    expect(useUiStore.getState().modal).toEqual(mockModal);
  });

  test('debe establecer snackbar correctamente', () => {
    const mockSnackbar = { open: true, message: 'Test message', duration: 4000, severity: 'success' as const };
    useUiStore.getState().setSnackbar(mockSnackbar);
    expect(useUiStore.getState().snackbar).toEqual(mockSnackbar);
  });

  test('debe establecer confirmation correctamente', () => {
    const mockConfirmation = { open: true, title: 'Confirm?', text: 'Are you sure?', actions: null };
    useUiStore.getState().setConfirmation(mockConfirmation);
    expect(useUiStore.getState().confirmation).toEqual(mockConfirmation);
  });

  test('debe establecer isSidebarCollapsed correctamente', () => {
    useUiStore.getState().setIsSidebarCollapsed(true);
    expect(useUiStore.getState().isSidebarCollapsed).toBe(true);

    useUiStore.getState().setIsSidebarCollapsed(false);
    expect(useUiStore.getState().isSidebarCollapsed).toBe(false);
  });
});
