import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProtectedRoute } from "../ProtectedRoute";

let mockAuthState: any = { isAuth: true };

jest.mock("../../stores", () => ({
  useAuhtStore: jest.fn((selector) => (selector ? selector(mockAuthState) : mockAuthState)),
}));

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div>NAVIGATE:{to}</div>,
  Outlet: () => <div>OUTLET_OK</div>,
}));

describe("ProtectedRoute", () => {
  test("muestra Outlet cuando está autenticado", () => {
    mockAuthState = { isAuth: true };
    render(<ProtectedRoute />);
    expect(screen.getByText("OUTLET_OK")).toBeInTheDocument();
  });

  test("redirige a login cuando no está autenticado", () => {
    mockAuthState = { isAuth: false };
    render(<ProtectedRoute />);
    expect(screen.getByText("NAVIGATE:/login")).toBeInTheDocument();
  });
});
