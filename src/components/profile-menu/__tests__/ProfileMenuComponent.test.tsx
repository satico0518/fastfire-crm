import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfileMenu from "../ProfileMenuComponent";

jest.mock("../../../utils/utils", () => ({
  getUserNameByKey: () => "Usuario Prueba",
}));

let mockUser: any = {
  key: "u1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  permissions: ["USER"],
  color: "#2196F3",
};

const mockSetNewUser = jest.fn();
const mockSetIsAuth = jest.fn();

jest.mock("../../../stores", () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      user: mockUser,
      setNewUser: mockSetNewUser,
      setIsAuth: mockSetIsAuth,
    })
  ),
}));

jest.mock("../../../stores/users/users.store", () => ({
  useUsersStore: jest.fn((selector) => selector({ users: [] })),
}));

const mockSetIsLoading = jest.fn();
const mockSetSnackbar = jest.fn();

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      setIsLoading: mockSetIsLoading,
      setSnackbar: mockSetSnackbar,
    })
  ),
}));

jest.mock("../../../services/auth.service", () => ({
  AuthService: {
    LogOut: jest.fn().mockResolvedValue({ result: "OK" }),
    changePassword: jest.fn().mockResolvedValue({ result: "OK" }),
  },
}));

jest.mock("../../../services/users.service", () => ({
  UsersService: {
    modifyUser: jest.fn(),
  },
}));

jest.mock("../../color-picker/ColorPickerComponent", () => ({
  ColorPickerComponent: ({ handleChange }: any) => (
    <div data-testid="color-picker-mock">
      <button onClick={() => handleChange({ hex: "#FF0000" })}>Change Color</button>
    </div>
  ),
}));

jest.mock("../../cloudinary/CloudinaryWidget", () => ({
  __esModule: true,
  default: () => <div data-testid="cloudinary-mock">Cloudinary mock</div>,
}));

describe("ProfileMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      key: "u1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      permissions: ["USER"],
      color: "#2196F3",
    };
  });

  const openMenu = () => {
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // The avatar icon button
  };

  it("abre menú y permite cerrar sesión", async () => {
    const { AuthService } = require("../../../services/auth.service");
    render(<ProfileMenu />);
    openMenu();

    expect(await screen.findByText("Salir")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Salir"));

    await waitFor(() => expect(AuthService.LogOut).toHaveBeenCalled());
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetIsAuth).toHaveBeenCalledWith(false);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it("maneja error en cerrar sesión", async () => {
    const { AuthService } = require("../../../services/auth.service");
    AuthService.LogOut.mockResolvedValueOnce({ result: "ERROR", errorMessage: "Logout failed" });
    render(<ProfileMenu />);
    openMenu();

    fireEvent.click(screen.getByText("Salir"));
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", message: "Logout failed" })
      );
    });
  });

  it("permite cambiar contraseña y muestra éxito", async () => {
    render(<ProfileMenu />);
    openMenu();

    fireEvent.click(screen.getByText("Cambiar contraseña"));
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" })
      );
    });
  });

  it("muestra error de cambio de contraseña cuando falla", async () => {
    const { AuthService } = require("../../../services/auth.service");
    AuthService.changePassword.mockResolvedValueOnce({ result: "ERROR" });
    render(<ProfileMenu />);
    openMenu();

    fireEvent.click(screen.getByText("Cambiar contraseña"));
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });

  it("muestra error si no hay correo válido", async () => {
    mockUser = { ...mockUser, email: null };
    render(<ProfileMenu />);
    openMenu();

    fireEvent.click(screen.getByText("Cambiar contraseña"));
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });

  it("captura excepción en cambio de contraseña", async () => {
    const { AuthService } = require("../../../services/auth.service");
    AuthService.changePassword.mockRejectedValueOnce(new Error("Net Error"));
    render(<ProfileMenu />);
    openMenu();

    fireEvent.click(screen.getByText("Cambiar contraseña"));
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });

  it("puede cambiar color de usuario", async () => {
    const { UsersService } = require("../../../services/users.service");
    render(<ProfileMenu />);
    openMenu();
    
    fireEvent.click(screen.getByText(/mi color/i));
    
    // simulate color change
    fireEvent.click(screen.getByText("Change Color"));
    expect(UsersService.modifyUser).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#FF0000" })
    );
    expect(mockSetNewUser).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#FF0000" })
    );
  });

  it("renderiza como PROVIDER", () => {
    mockUser = { ...mockUser, permissions: ["PROVIDER"] };
    render(<ProfileMenu />);
    expect(screen.getByText(/Usuario Prueba/i)).toBeInTheDocument();
  });

  it("renderiza con foto de perfil avatarURL", () => {
    mockUser = { ...mockUser, avatarURL: "http://photo.com/a.jpg" };
    render(<ProfileMenu />);
    openMenu();
    expect(screen.getByText("Editar Foto")).toBeInTheDocument();
  });
});
