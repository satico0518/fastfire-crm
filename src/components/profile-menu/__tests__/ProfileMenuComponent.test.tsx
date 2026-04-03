import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfileMenu from "../ProfileMenuComponent";

jest.mock("../../../utils/utils", () => ({
  getUserNameByKey: () => "Usuario Prueba",
}));

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) =>
    selector({
      user: {
        key: "u1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        permissions: ["USER"],
        color: "#2196F3",
      },
      setNewUser: jest.fn(),
      setIsAuth: jest.fn(),
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
  ColorPickerComponent: () => <div>Color picker mock</div>,
}));

jest.mock("../../cloudinary/CloudinaryWidget", () => ({
  __esModule: true,
  default: () => <div>Cloudinary mock</div>,
}));

describe("ProfileMenu", () => {
  beforeEach(() => {
    mockSetIsLoading.mockClear();
    mockSetSnackbar.mockClear();
  });

  it("abre menú y permite cerrar sesión", async () => {
    const { AuthService } = require("../../../services/auth.service");
    render(<ProfileMenu />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(await screen.findByText("Salir")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Salir"));

    await waitFor(() => expect(AuthService.LogOut).toHaveBeenCalled());
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });
});
