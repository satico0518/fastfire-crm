import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HomePage } from "../home/HomePage";
import { LoginPage } from "../login/LoginPage";
import { FormatsPage } from "../formats/FormatsPage";
import { PurchasingManagerPage } from "../purchasing-manager/PurchasingManagerPage";
import { TasksbyGroupPage } from "../tasks-by-group/TasksbyGroupPage";
import { AdministratorPage } from "../administrator/AdministratorPage";
import { TasksPage } from "../tasks-groups/TasksGroupsPage";

const mockNavigate = jest.fn();
let mockLocationState: any = undefined;
let mockAuthState: any = {
  isAuth: true,
  hasHydrated: true,
  user: {
    key: "u1",
    firstName: "Juan",
    lastName: "Perez",
    permissions: ["ADMIN", "TYG", "FORMATER", "PURCHASE"],
    workgroupKeys: ["wg1"],
  },
  setNewUser: jest.fn(),
  setIsAuth: jest.fn(),
  setToken: jest.fn(),
};

let mockUiState: any = {
  isLoading: false,
  setIsLoading: jest.fn(),
  modal: { open: false, title: "", text: "", content: null },
  setModal: jest.fn(),
};

const mockSignIn = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  };
});

jest.mock("../../stores", () => ({
  useAuthStore: jest.fn((selector) => (selector ? selector(mockAuthState) : mockAuthState)),
}));

jest.mock("../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) => (selector ? selector(mockUiState) : mockUiState)),
}));

jest.mock("../../services/auth.service", () => ({
  AuthService: {
    signIn: (...args: unknown[]) => mockSignIn(...args),
  },
}));

jest.mock("../../components/format-selector/FormatSelector", () => ({
  FormatSelector: () => <div>Format selector mock</div>,
}));

jest.mock("../../components/format-results/FormatResultsTable", () => ({
  FormatResultsTable: () => <div>Format results mock</div>,
}));

jest.mock("../../components/comercial-container/ComercialContainer", () => ({
  ComercialContainer: () => <div>Comercial container mock</div>,
}));

jest.mock("../../components/provider-container/ProviderContainer", () => ({
  ProviderContainer: () => <div>Provider container mock</div>,
}));

jest.mock("../../components/table/TasksTableComponent", () => ({
  __esModule: true,
  default: ({ workgroup }: { workgroup?: { name?: string } }) => (
    <div>Tasks table mock {workgroup?.name || "general"}</div>
  ),
}));

jest.mock("../../components/table/UsersTableComponent", () => ({
  __esModule: true,
  default: () => <div>Users table mock</div>,
}));

jest.mock("../../components/table/ProjectsTableComponent", () => ({
  __esModule: true,
  default: () => <div>Projects table mock</div>,
}));

jest.mock("../../components/table/WorkgroupsTableComponent", () => ({
  __esModule: true,
  default: () => <div>Workgroups table mock</div>,
}));

jest.mock("../../components/workgroups-form/WorkgroupsFormComponent", () => ({
  WorkgroupsFormComponent: () => <div>Workgroups form mock</div>,
}));

jest.mock("../../components/user-form/UserFormComponent", () => ({
  UserFormComponent: () => <div>User form mock</div>,
}));

jest.mock("../../components/projects-form/ProjectsFormComponent", () => ({
  ProjectsFormComponent: () => <div>Projects form mock</div>,
}));

describe("Pages smoke coverage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSignIn.mockReset();
    mockAuthState = {
      isAuth: true,
      hasHydrated: true,
      user: {
        key: "u1",
        firstName: "Juan",
        lastName: "Perez",
        permissions: ["ADMIN", "TYG", "FORMATER", "PURCHASE"],
        workgroupKeys: ["wg1"],
      },
      setNewUser: jest.fn(),
      setIsAuth: jest.fn(),
      setToken: jest.fn(),
    };
    mockUiState = {
      isLoading: false,
      setIsLoading: jest.fn(),
      modal: { open: false, title: "", text: "", content: null },
      setModal: jest.fn(),
    };
    mockLocationState = undefined;
  });

  test("HomePage renderiza y navega desde acceso rapido", () => {
    render(<HomePage />);
    expect(screen.getByText("Acceso Rápido")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tareas & Grupos"));
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  test("LoginPage inicia sesion correctamente", async () => {
    mockSignIn.mockResolvedValue({
      result: "OK",
      firebaseUser: { getIdToken: jest.fn().mockResolvedValue("token-1") },
      user: { key: "u1" },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Correo Electrónico"), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/home"));
    expect(mockUiState.setIsLoading).toHaveBeenCalled();
  });

  test("FormatsPage muestra pestañas para admin", () => {
    render(<FormatsPage />);
    expect(screen.getByText("Formatos")).toBeInTheDocument();
    expect(screen.getByText("Resultados")).toBeInTheDocument();
  });

  test("PurchasingManagerPage muestra contenedor de compras", () => {
    render(<PurchasingManagerPage />);
    expect(screen.getByText("Comercial container mock")).toBeInTheDocument();
  });

  test("TasksbyGroupPage renderiza tabla con grupo", () => {
    mockLocationState = { wg: { key: "wg1", name: "Grupo A" } };
    render(<TasksbyGroupPage />);
    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText(/Tasks table mock Grupo A/i)).toBeInTheDocument();
  });

  test("TasksbyGroupPage redirige cuando no hay state", () => {
    render(<TasksbyGroupPage />);
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  test("AdministratorPage renderiza tablas y botones", () => {
    render(<AdministratorPage />);
    expect(screen.getByText("Listado de Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Nuevo Usuario")).toBeInTheDocument();
  });

  test("TasksPage renderiza tabs cuando usuario tiene permiso TYG", () => {
    render(<TasksPage />);
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.getByText("Grupos de trabajo")).toBeInTheDocument();
  });
});
