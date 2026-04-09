/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { TasksPage } from '../TasksGroupsPage';

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetModal = jest.fn();

// El componente llama useAuhtStore con selectores distintos:
//   (state) => state.user
//   (state) => state.hasHydrated
// El mock debe ejecutar el selector sobre el objeto completo.
const mockAuthState = {
  user: { key: 'admin', permissions: ['TYG', 'ADMIN'] },
  hasHydrated: true,
};

jest.mock('../../../stores', () => ({
  useAuthStore: jest.fn((selector: Function) => selector(mockAuthState)),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) => selector({
    modal: { open: false },
    setModal: mockSetModal,
  })),
}));

// ─── Mocks de sub-componentes pesados ────────────────────────────────────────
jest.mock('../../../components/table/TasksTableComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-table">TasksTable</div>,
}));

jest.mock('../../../components/table/WorkgroupsTableComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="workgroups-table">WorkgroupsTable</div>,
}));

jest.mock('../../../components/workgroups-form/WorkgroupsFormComponent', () => ({
  WorkgroupsFormComponent: () => <div data-testid="workgroups-form">WorkgroupsForm</div>,
}));

jest.mock('../../../pages/unauthorized/UnauthorizedPage', () => ({
  UnauthorizedPage: () => <div data-testid="unauthorized">Unauthorized</div>,
}));

// ─── Helper ───────────────────────────────────────────────────────────────────
const renderPage = (locationState?: object) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/', state: locationState }]}>
      <TasksPage />
    </MemoryRouter>
  );

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('TasksGroupsPage (TasksPage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restaurar estado por defecto del mock de auth
    mockAuthState.user = { key: 'admin', permissions: ['TYG', 'ADMIN'] };
    mockAuthState.hasHydrated = true;

    const { useAuthStore } = require('../../../stores');
    (useAuthStore as jest.Mock).mockImplementation((selector: Function) => selector(mockAuthState));
  });

  // ── Estado no hidratado ───────────────────────────────────────────────────
  describe('estado de carga', () => {
    test('debe renderizar null hasta que el store esté hidratado', () => {
      mockAuthState.hasHydrated = false;
      const { useAuthStore } = require('../../../stores');
      (useAuthStore as jest.Mock).mockImplementation((selector: Function) =>
        selector(mockAuthState)
      );

      const { container } = renderPage();
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Renderizado normal ────────────────────────────────────────────────────
  describe('renderizado con store hidratado', () => {
    test('debe renderizar sin errores', () => {
      renderPage();
      expect(document.body).toBeTruthy();
    });

    test('debe mostrar la pestaña "Tareas"', () => {
      renderPage();
      expect(screen.getByRole('tab', { name: /Tareas/i })).toBeInTheDocument();
    });

    test('debe mostrar la pestaña "Grupos de trabajo"', () => {
      renderPage();
      expect(screen.getByRole('tab', { name: /Grupos de trabajo/i })).toBeInTheDocument();
    });

    test('debe mostrar TasksTable en la primera pestaña por defecto', () => {
      renderPage();
      expect(screen.getByTestId('tasks-table')).toBeInTheDocument();
    });
  });

  // ── Navegación entre pestañas ─────────────────────────────────────────────
  describe('navegación de pestañas', () => {
    test('debe mostrar la tabla de grupos al cambiar de pestaña', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /Grupos de trabajo/i }));
      expect(screen.getByTestId('workgroups-table')).toBeInTheDocument();
    });

    test('debe mostrar el botón "Nuevo Grupo" en la pestaña de Grupos', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /Grupos de trabajo/i }));
      expect(screen.getByRole('button', { name: /Nuevo Grupo/i })).toBeInTheDocument();
    });

    test('debe abrir el modal al hacer click en Nuevo Grupo', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /Grupos de trabajo/i }));
      fireEvent.click(screen.getByRole('button', { name: /Nuevo Grupo/i }));
      expect(mockSetModal).toHaveBeenCalledWith(
        expect.objectContaining({ open: true, title: 'Nuevo Grupo de trabajo' })
      );
    });
  });

  // ── Estado inicial con goTo: "wg" ─────────────────────────────────────────
  describe('estado de ruta', () => {
    test('debe iniciar en la pestaña "Grupos" si state.goTo es "wg"', () => {
      renderPage({ goTo: 'wg' });
      expect(screen.getByTestId('workgroups-table')).toBeInTheDocument();
    });

    test('debe iniciar en pestaña "Tareas" si no hay state.goTo', () => {
      renderPage();
      expect(screen.getByTestId('tasks-table')).toBeInTheDocument();
    });
  });

  // ── Sin permisos TYG ─────────────────────────────────────────────────────
  describe('sin permisos TYG', () => {
    test('debe mostrar UnauthorizedPage si el usuario no tiene permiso TYG', () => {
      mockAuthState.user = { key: 'u1', permissions: ['VIEWER'] } as any;
      const { useAuthStore } = require('../../../stores');
      (useAuthStore as jest.Mock).mockImplementation((selector: Function) =>
        selector(mockAuthState)
      );

      renderPage();
      // El componente renderiza dos CustomTabPanel, ambos sin TYG muestran Unauthorized
      const unauthorizedElements = screen.getAllByTestId('unauthorized');
      expect(unauthorizedElements.length).toBeGreaterThan(0);
    });
  });
});
