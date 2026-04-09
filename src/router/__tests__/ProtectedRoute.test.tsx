import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProtectedRoute } from "../ProtectedRoute";

let mockAuthState: any = { isAuth: true, hasHydrated: true };

jest.mock("../../stores", () => ({
  useAuthStore: jest.fn(() => mockAuthState),
}));

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div>NAVIGATE:{to}</div>,
  Outlet: () => <div>OUTLET_OK</div>,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra Outlet cuando está autenticado y hidratado", () => {
    mockAuthState = { isAuth: true, hasHydrated: true };
    render(<ProtectedRoute />);
    expect(screen.getByText("OUTLET_OK")).toBeInTheDocument();
  });

  test("redirige a login cuando no está autenticado pero está hidratado", () => {
    mockAuthState = { isAuth: false, hasHydrated: true };
    render(<ProtectedRoute />);
    expect(screen.getByText("NAVIGATE:/login")).toBeInTheDocument();
  });

  test("no renderiza nada mientras se rehidrata", () => {
    mockAuthState = { isAuth: false, hasHydrated: false };
    const { container } = render(<ProtectedRoute />);
    expect(container.firstChild).toBeNull();
  });
});
