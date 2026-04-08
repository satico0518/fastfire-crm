import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../HeaderComponent";
import { useAuhtStore } from "../../../stores/auth/auth.store";

jest.mock("../../../stores/auth/auth.store");
jest.mock("../../profile-menu/ProfileMenuComponent", () => () => <div data-testid="profile-menu" />);
jest.mock("../../../assets/img/Logo.jpg", () => "logo-stub");

describe("HeaderComponent", () => {
  const mockOnToggleMobileMenu = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no debe renderizar nada si no está autenticado", () => {
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) => selector({ isAuth: false }));
    const { container } = render(<Header isMobileMenuOpen={false} onToggleMobileMenu={mockOnToggleMobileMenu} />);
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar el logo y el menú de perfil si está autenticado", () => {
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) => selector({ isAuth: true }));
    render(<Header isMobileMenuOpen={false} onToggleMobileMenu={mockOnToggleMobileMenu} />);
    
    expect(screen.getByAltText("logo fastfire de colombia")).toBeInTheDocument();
    expect(screen.getByText("CRM")).toBeInTheDocument();
    expect(screen.getByTestId("profile-menu")).toBeInTheDocument();
  });

  it("debe mostrar el ícono de hamburguesa correcto según el estado del menú", () => {
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) => selector({ isAuth: true }));
    
    const { rerender } = render(<Header isMobileMenuOpen={false} onToggleMobileMenu={mockOnToggleMobileMenu} />);
    expect(screen.getByText("☰")).toBeInTheDocument();

    rerender(<Header isMobileMenuOpen={true} onToggleMobileMenu={mockOnToggleMobileMenu} />);
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("debe llamar a onToggleMobileMenu al hacer clic en el botón de hamburguesa", () => {
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) => selector({ isAuth: true }));
    render(<Header isMobileMenuOpen={false} onToggleMobileMenu={mockOnToggleMobileMenu} />);
    
    fireEvent.click(screen.getByLabelText("Toggle navigation menu"));
    expect(mockOnToggleMobileMenu).toHaveBeenCalledTimes(1);
  });
});
