import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnauthorizedPage } from '../UnauthorizedPage';

jest.mock('../../../assets/img/acceso-restringido.jpeg', () => 'acceso-restringido.jpeg');

describe('UnauthorizedPage', () => {
  test('debe renderizar sin errores', () => {
    render(<UnauthorizedPage />);
    expect(document.body).toBeTruthy();
  });

  test('debe mostrar la imagen de acceso restringido', () => {
    render(<UnauthorizedPage />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('width', '300');
  });

  test('debe tener un contenedor con clase "container"', () => {
    const { container } = render(<UnauthorizedPage />);
    expect(container.querySelector('.container')).toBeInTheDocument();
  });
});
