import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PurchasingManagerPage } from '../PurchasingManagerPage';

// ─── Mocks de assets ─────────────────────────────────────────────────────────
jest.mock('../../../assets/img/acceso-restringido.jpeg', () => 'acceso-restringido.jpeg');

// ─── Mock de sub-componentes pesados ─────────────────────────────────────────
jest.mock('../../../components/comercial-container/ComercialContainer', () => ({
  ComercialContainer: () => <div data-testid="comercial-container">Comercial</div>,
}));

jest.mock('../../../components/provider-container/ProviderContainer', () => ({
  ProviderContainer: () => <div data-testid="provider-container">Provider</div>,
}));

// ─── Mock auth store configurable ─────────────────────────────────────────────
let mockUser: any = { key: 'u1', permissions: ['PURCHASE'] };

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector: Function) => selector({ user: mockUser })),
}));

describe('PurchasingManagerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe mostrar UnauthorizedPage si el usuario no tiene permiso PURCHASE o PROVIDER', () => {
    mockUser = { key: 'u1', permissions: ['TYG'] };
    render(<PurchasingManagerPage />);
    // UnauthorizedPage renders an img
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('debe mostrar ComercialContainer si el usuario tiene permiso PURCHASE', () => {
    mockUser = { key: 'u1', permissions: ['PURCHASE'] };
    render(<PurchasingManagerPage />);
    expect(screen.getByTestId('comercial-container')).toBeInTheDocument();
    expect(screen.queryByTestId('provider-container')).not.toBeInTheDocument();
  });

  test('debe mostrar ProviderContainer si el usuario tiene permiso PROVIDER', () => {
    mockUser = { key: 'u2', permissions: ['PROVIDER'] };
    render(<PurchasingManagerPage />);
    expect(screen.getByTestId('provider-container')).toBeInTheDocument();
    expect(screen.queryByTestId('comercial-container')).not.toBeInTheDocument();
  });

  test('debe mostrar ambos containers si el usuario tiene ambos permisos', () => {
    mockUser = { key: 'u3', permissions: ['PURCHASE', 'PROVIDER'] };
    render(<PurchasingManagerPage />);
    expect(screen.getByTestId('comercial-container')).toBeInTheDocument();
    expect(screen.getByTestId('provider-container')).toBeInTheDocument();
  });
});
