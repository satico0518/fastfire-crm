import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SecondaryActions, { SecondaryActionsProps } from '../SecondaryActions';

jest.mock('@mui/material/Menu', () => {
  return function MockMenu({ open, children }: { open: boolean; children: React.ReactNode }) {
    return open ? <div data-testid="secondary-menu">{children}</div> : null;
  };
});

jest.mock('@mui/material/MenuItem', () => {
  return function MockMenuItem({ children, onClick, selected }: { children: React.ReactNode; onClick: () => void; selected?: boolean }) {
    return (
      <button type="button" data-selected={selected ? 'true' : 'false'} onClick={onClick}>
        {children}
      </button>
    );
  };
});

jest.mock('@mui/material/IconButton', () => {
  return function MockIconButton({ children, onClick, ...props }: { children: React.ReactNode; onClick: () => void; [key: string]: unknown }) {
    return (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    );
  };
});

jest.mock('@mui/icons-material/MoreVert', () => () => <span data-testid="more-vert-icon" />);

describe('SecondaryActions', () => {
  const renderComponent = (props: SecondaryActionsProps) => render(<SecondaryActions {...props} />);

  const options: SecondaryActionsProps['options'] = [
    {
      icon: <span data-testid="icon-a">A</span>,
      label: 'Editar',
      action: jest.fn(),
    },
    {
      icon: <span data-testid="icon-b">B</span>,
      label: 'Eliminar',
      action: jest.fn(),
    },
    {
      icon: <span data-testid="icon-c">C</span>,
      label: 'Pyxis',
      action: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no muestra el menú inicialmente', () => {
    renderComponent({ options });

    expect(screen.queryByTestId('secondary-menu')).not.toBeInTheDocument();
    expect(screen.getByLabelText('more')).toBeInTheDocument();
  });

  it('abre el menú al hacer click en el boton principal', () => {
    renderComponent({ options });

    fireEvent.click(screen.getByLabelText('more'));

    expect(screen.getByTestId('secondary-menu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eliminar/ })).toBeInTheDocument();
  });

  it('ejecuta la accion de una opcion al seleccionarla', () => {
    renderComponent({ options });

    fireEvent.click(screen.getByLabelText('more'));
    fireEvent.click(screen.getByRole('button', { name: /Eliminar/ }));

    expect(options[1].action).toHaveBeenCalledTimes(1);
  });

  it('marca Pyxis como selected', () => {
    renderComponent({ options });

    fireEvent.click(screen.getByLabelText('more'));

    expect(screen.getByRole('button', { name: /Pyxis/ })).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: /Editar/ })).toHaveAttribute('data-selected', 'false');
  });

  it('acepta una lista vacia de opciones', () => {
    renderComponent({ options: [] });

    fireEvent.click(screen.getByLabelText('more'));

    expect(screen.getByTestId('secondary-menu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });
});
