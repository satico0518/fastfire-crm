import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AppRouter } from "../AppRouter";

let mockAuthState: any = {
  isAuth: true,
  user: { permissions: ["ADMIN"] },
};

let mockUiState: any = {
  isLoading: false,
};

jest.mock("../../stores", () => ({
  useAuthStore: jest.fn((selector) => (selector ? selector(mockAuthState) : mockAuthState)),
}));

jest.mock("../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) => (selector ? selector(mockUiState) : mockUiState)),
}));

jest.mock("../../pages/tasks-groups/TasksGroupsPage", () => ({
  TasksPage: () => <div>Tasks page mock</div>,
}));
jest.mock("../../pages/tasks-by-group/TasksbyGroupPage", () => ({
  TasksbyGroupPage: () => <div>Tasks by group page mock</div>,
}));
jest.mock("../../pages/purchasing-manager/PurchasingManagerPage", () => ({
  PurchasingManagerPage: () => <div>Purchasing page mock</div>,
}));
jest.mock("../../pages/login/LoginPage", () => ({
  LoginPage: () => <div>Login page mock</div>,
}));
jest.mock("../../pages/home/HomePage", () => ({
  HomePage: () => <div>Home page mock</div>,
}));
jest.mock("../../pages/administrator/AdministratorPage", () => ({
  AdministratorPage: () => <div>Admin page mock</div>,
}));
jest.mock("../../pages/formats/FormatsPage", () => ({
  FormatsPage: () => <div>Formats page mock</div>,
}));
jest.mock("../../pages/agenda-mantenimientos/AgendaMantenimientosPage", () => ({
  AgendaMantenimientosPage: () => <div>Agenda page mock</div>,
}));
jest.mock("../../pages/formats/PublicFormatPage", () => ({
  PublicFormatPage: () => <div>Public format page mock</div>,
}));
jest.mock("../../pages/formats/PublicFormatResultsPage", () => ({
  PublicFormatResultsPage: () => <div>Public format results page mock</div>,
}));
jest.mock("../../components/modal/ModalComponent", () => ({
  __esModule: true,
  default: () => <div>Modal component mock</div>,
}));
jest.mock("../../components/snackbar/SnackbarComponent", () => ({
  SnackbarComponent: () => <div>Snackbar component mock</div>,
}));
jest.mock("../../components/confirmation/ConfirmationComponent", () => ({
  ConfirmationComponent: () => <div>Confirmation component mock</div>,
}));
describe("Router and App smoke", () => {
  beforeEach(() => {
    mockAuthState = {
      isAuth: true,
      user: { permissions: ["ADMIN"] },
    };
    mockUiState = { isLoading: false };
  });

  test("AppRouter renderiza ruta publica de login", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText("Login page mock")).toBeInTheDocument();
  });

  test("AppRouter renderiza ruta protegida cuando está autenticado", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(screen.getByText("Home page mock")).toBeInTheDocument();
    expect(screen.getByText("Modal component mock")).toBeInTheDocument();
  });
});
