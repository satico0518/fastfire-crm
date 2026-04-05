import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';

// ─── Mocks de navegación ───────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ─── Mock del asset de imagen ─────────────────────────────────────────────────
jest.mock('../../../assets/fire-suppression-hero.png', () => 'hero-image.png');

// ─── State de auth configurable ──────────────────────────────────────────────
let mockUser: any = {
  key: 'admin1',
  firstName: 'Juan',
  lastName: 'García',
  permissions: ['ADMIN'],
  workgroupKeys: [],
};

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector: Function) =>
    selector({ user: mockUser })
  ),
}));

// ─── Helper de render ─────────────────────────────────────────────────────────
const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { key: 'admin1', firstName: 'Juan', lastName: 'García', permissions: ['ADMIN'], workgroupKeys: [] };
  });

  describe('renderizado inicial', () => {
    test('debe renderizar el hero con el título principal', () => {
      renderPage();
      expect(screen.getByText(/CRM de Gestión/i)).toBeInTheDocument();
      // Use role heading to be specific
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    test('debe mostrar las estadísticas', () => {
      renderPage();
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('CRM')).toBeInTheDocument();
      expect(screen.getByText('Agenda')).toBeInTheDocument();
      expect(screen.getByText('Grupos')).toBeInTheDocument();
    });

    test('debe mostrar acceso rápido', () => {
      renderPage();
      expect(screen.getByText('Acceso Rápido')).toBeInTheDocument();
    });

    test('debe mostrar footer con versión', () => {
      renderPage();
      // Use within or getByText with exact match to pinpoint the footer
      const footerText = screen.getAllByText(/v2.0/i);
      expect(footerText.length).toBeGreaterThan(0);
    });
  });

  describe('información del usuario autenticado', () => {
    test('debe mostrar nombre del usuario admin', () => {
      renderPage();
      expect(screen.getByText(/Juan García/i)).toBeInTheDocument();
    });

    test('debe mostrar etiqueta de Administrador para usuario ADMIN', () => {
      renderPage();
      expect(screen.getByText(/Administrador/i)).toBeInTheDocument();
    });

    test('debe mostrar etiqueta de Usuario para usuario no admin', () => {
      mockUser = { key: 'u1', firstName: 'María', lastName: 'López', permissions: ['TYG'], workgroupKeys: [] };
      renderPage();
      expect(screen.getByText(/María López/i)).toBeInTheDocument();
      expect(screen.getByText(/👤 Usuario/i)).toBeInTheDocument();
    });

    test('no debe mostrar el bloque de usuario si no hay usuario', () => {
      mockUser = null;
      renderPage();
      // with no user, the user info block shouldn't be rendered
      expect(screen.queryByText(/Administrador/i)).not.toBeInTheDocument();
    });
  });

  describe('acceso rápido - filtro por permisos', () => {
    test('admin debe ver todos los links de acceso rápido', () => {
      mockUser = { ...mockUser, permissions: ['ADMIN'] };
      renderPage();
      expect(screen.getByText('Tareas & Grupos')).toBeInTheDocument();
      expect(screen.getByText('Agenda Mantenimientos')).toBeInTheDocument();
      expect(screen.getByText('Comercial / Compras')).toBeInTheDocument();
      expect(screen.getByText('Formatos')).toBeInTheDocument();
    });

    test('usuario PURCHASE no debe ver Tareas & Grupos (requiere ADMIN)', () => {
      mockUser = { ...mockUser, permissions: ['PURCHASE'] };
      renderPage();
      expect(screen.queryByText('Tareas & Grupos')).not.toBeInTheDocument();
      expect(screen.getByText('Comercial / Compras')).toBeInTheDocument();
      expect(screen.getByText('Formatos')).toBeInTheDocument();
    });

    test('usuario TYG solo debe ver Formatos (sin permiso específico)', () => {
      mockUser = { ...mockUser, permissions: ['TYG'] };
      renderPage();
      expect(screen.queryByText('Tareas & Grupos')).not.toBeInTheDocument();
      expect(screen.queryByText('Comercial / Compras')).not.toBeInTheDocument();
      expect(screen.getByText('Formatos')).toBeInTheDocument();
    });
  });

  describe('navegación desde acceso rápido', () => {
    test('debe navegar a /tasks al hacer click en Tareas & Grupos (como admin)', () => {
      renderPage();
      fireEvent.click(screen.getByText('Tareas & Grupos'));
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });

    test('debe navegar a /agenda-mantenimientos al hacer click en Agenda', () => {
      renderPage();
      fireEvent.click(screen.getByText('Agenda Mantenimientos'));
      expect(mockNavigate).toHaveBeenCalledWith('/agenda-mantenimientos');
    });

    test('debe navegar a /formats al hacer click en Formatos', () => {
      renderPage();
      fireEvent.click(screen.getByText('Formatos'));
      expect(mockNavigate).toHaveBeenCalledWith('/formats');
    });

    test('debe navegar a /purchasing-manager al hacer click en Comercial / Compras', () => {
      renderPage();
      fireEvent.click(screen.getByText('Comercial / Compras'));
      expect(mockNavigate).toHaveBeenCalledWith('/purchasing-manager');
    });
  });

  describe('interacciones hover en stats cards', () => {
    test('debe cambiar estilos en mouseenter de una stat card', () => {
      renderPage();
      const card = screen.getByText('24/7').closest('div')?.parentElement;
      if (card) {
        fireEvent.mouseEnter(card);
        expect(card.style.borderColor).toBeTruthy();
        fireEvent.mouseLeave(card);
        expect(card.style.borderColor).toBeTruthy();
      }
    });
  });
});
