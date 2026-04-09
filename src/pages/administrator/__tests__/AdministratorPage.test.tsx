/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AdministratorPage } from '../AdministratorPage';

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetModal = jest.fn();

const mockAuthState = {
  user: { key: 'admin', permissions: ['ADMIN'] },
};

jest.mock('../../../stores', () => ({
  useAuthStore: jest.fn((selector: Function) => selector(mockAuthState)),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({ modal: { open: false }, setModal: mockSetModal })
  ),
}));

// ─── Mocks de sub-componentes pesados ────────────────────────────────────────
jest.mock('../../../components/table/UsersTableComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="users-table">UsersTable</div>,
}));

jest.mock('../../../components/table/ProjectsTableComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="projects-table">ProjectsTable</div>,
}));

jest.mock('../../../components/user-form/UserFormComponent', () => ({
  UserFormComponent: () => <div data-testid="user-form">UserForm</div>,
}));

jest.mock('../../../components/projects-form/ProjectsFormComponent', () => ({
  ProjectsFormComponent: () => <div data-testid="projects-form">ProjectsForm</div>,
}));

jest.mock('../../../pages/unauthorized/UnauthorizedPage', () => ({
  UnauthorizedPage: () => <div data-testid="unauthorized">Unauthorized</div>,
}));

// ─── Helper ───────────────────────────────────────────────────────────────────
const renderPage = () =>
  render(
    <MemoryRouter>
      <AdministratorPage />
    </MemoryRouter>
  );

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('AdministratorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.user = { key: 'admin', permissions: ['ADMIN'] };
    const { useAuthStore } = require('../../../stores');
    (useAuthStore as jest.Mock).mockImplementation((selector: Function) =>
      selector(mockAuthState)
    );
  });

  // ── Control de acceso ─────────────────────────────────────────────────────
  describe('control de acceso', () => {
    test('debe mostrar UnauthorizedPage si el usuario NO tiene permiso ADMIN', () => {
      mockAuthState.user = { key: 'u1', permissions: ['TYG'] } as any;
      const { useAuthStore } = require('../../../stores');
      (useAuthStore as jest.Mock).mockImplementation((selector: Function) =>
        selector(mockAuthState)
      );
      renderPage();
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    test('debe renderizar la página si el usuario tiene permiso ADMIN', () => {
      renderPage();
      expect(screen.queryByTestId('unauthorized')).not.toBeInTheDocument();
    });
  });

  // ── Renderizado inicial ───────────────────────────────────────────────────
  describe('renderizado inicial', () => {
    test('debe mostrar la pestaña "Listado de Usuarios"', () => {
      renderPage();
      expect(screen.getByRole('tab', { name: /Listado de Usuarios/i })).toBeInTheDocument();
    });

    test('debe mostrar la pestaña "Proyectos"', () => {
      renderPage();
      expect(screen.getByRole('tab', { name: /Proyectos/i })).toBeInTheDocument();
    });

    test('debe mostrar UsersTable en la primera pestaña por defecto', () => {
      renderPage();
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    test('debe mostrar el botón "Nuevo Usuario" en la primera pestaña', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /Nuevo Usuario/i })).toBeInTheDocument();
    });
  });

  // ── Navegación entre tabs ─────────────────────────────────────────────────
  describe('navegación de pestañas', () => {
    test('debe mostrar ProjectsTable al cambiar a la pestaña Proyectos', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /Proyectos/i }));
      expect(screen.getByTestId('projects-table')).toBeInTheDocument();
    });

    test('debe mostrar el botón "Nuevo Proyecto" en la pestaña de Proyectos', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /Proyectos/i }));
      expect(screen.getByRole('button', { name: /Nuevo Proyecto/i })).toBeInTheDocument();
    });
  });

  // ── Apertura de modales ───────────────────────────────────────────────────
  describe('apertura de modales', () => {
    test('debe abrir el modal de Nuevo Usuario al hacer click', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /Nuevo Usuario/i }));
      expect(mockSetModal).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          title: 'Nuevo Usuario',
        })
      );
    });

    test('debe abrir el modal de Nuevo Proyecto al hacer click', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /Proyectos/i }));
      fireEvent.click(screen.getByRole('button', { name: /Nuevo Proyecto/i }));
      expect(mockSetModal).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          title: 'Nuevo Proyecto',
        })
      );
    });
  });
});
