import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { MenuComponent } from "../MenuComponent";
import { WorkgroupService } from "../../../services/workgroup.service";
import { useAuhtStore } from "../../../stores";
import { useWorkgroupStore } from "../../../stores/workgroups/workgroups.store";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

let mockUser: any = {
  key: "u1",
  permissions: ["ADMIN", "PLANNER"],
  workgroupKeys: ["wg1"],
};
let mockHasHydrated = true;
let mockIsAuth = true;
let mockWorkgroups: any[] = [
  {
    id: "1",
    key: "wg1",
    name: "Equipo Alpha",
    isActive: true,
    isPrivate: false,
    color: "#4CAF50",
    memberKeys: [],
    createdDate: 0,
  },
];

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) =>
    selector({
      isAuth: mockIsAuth,
      hasHydrated: mockHasHydrated,
      user: mockUser,
    })
  ),
}));

jest.mock("../../../stores/workgroups/workgroups.store", () => ({
  useWorkgroupStore: jest.fn((selector) =>
    selector({
      workgroups: mockWorkgroups,
    })
  ),
}));

jest.mock("../../menu-secondary/SecondaryActions", () => ({
  __esModule: true,
  default: ({ options }: { options: { label: string; action: () => void }[] }) => (
    <div>
      {options.map((opt) => (
        <button key={opt.label} onClick={opt.action} type="button">
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("../../workgroups-form/WorkgroupsFormComponent", () => ({
  WorkgroupsFormComponent: () => <div data-testid="workgroups-form">WorkgroupsForm</div>,
}));

jest.mock("../../tasks-form/TasksFormComponent", () => ({
  TasksFormComponent: ({ workgroupKey }: { workgroupKey: string }) => (
    <div data-testid="tasks-form">TasksForm-{workgroupKey}</div>
  ),
}));

const mockSetIsSidebarCollapsed = jest.fn();
const mockSetModal = jest.fn();
const mockSetConfirmation = jest.fn();
const mockSetSnackbar = jest.fn();
let mockIsSidebarCollapsed = false;

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      isSidebarCollapsed: mockIsSidebarCollapsed,
      setIsSidebarCollapsed: mockSetIsSidebarCollapsed,
      setModal: mockSetModal,
      modal: { open: false, title: "", content: null },
      setConfirmation: mockSetConfirmation,
      setSnackbar: mockSetSnackbar,
    })
  ),
}));

jest.mock("../../../stores/tasks/tasks.store", () => ({
  useTasksStore: jest.fn((selector) => selector({ tasks: [] })),
}));

jest.mock("../../../stores/users/users.store", () => ({
  useUsersStore: jest.fn((selector) => selector({ users: [] })),
}));

jest.mock("../../../services/workgroup.service", () => ({
  WorkgroupService: {
    deleteWorkgroup: jest.fn(),
  },
}));

describe("MenuComponent", () => {
  const onCloseMobileMenu = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      key: "u1",
      permissions: ["ADMIN", "PLANNER"],
      workgroupKeys: ["wg1"],
    };
    mockIsSidebarCollapsed = false;
    mockHasHydrated = true;
    mockIsAuth = true;
    mockWorkgroups = [
      {
        id: "1",
        key: "wg1",
        name: "Equipo Alpha",
        isActive: true,
        isPrivate: false,
        color: "#4CAF50",
        memberKeys: [],
        createdDate: 0,
      },
    ];
  });

  const renderComponent = (isMobileMenuOpen = false) => {
    return render(
      <MemoryRouter>
        <MenuComponent
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={onCloseMobileMenu}
        />
      </MemoryRouter>
    );
  };

  it("renderiza enlaces principales para ADMIN", () => {
    renderComponent();

    expect(screen.getByText("T&G")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Formatos")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("no renderiza nada si no ha hidratado", () => {
    mockHasHydrated = false;
    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it("no renderiza nada si no esta autenticado", () => {
    mockIsAuth = false;
    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it("renderiza correctamente al estar en modo collapsed", () => {
    mockIsSidebarCollapsed = true;
    renderComponent();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("permite a PURCHASE ver el link Comercial", () => {
    mockUser = { permissions: ["PURCHASE"], workgroupKeys: [] };
    renderComponent();
    expect(screen.getByText("Comercial")).toBeInTheDocument();
  });

  it("permite a PROVIDER ver el link Cotización", () => {
    mockUser = { permissions: ["PROVIDER"], workgroupKeys: [] };
    renderComponent();
    expect(screen.getByText("Cotización")).toBeInTheDocument();
    expect(screen.queryByText("Formatos")).not.toBeInTheDocument();
  });

  it("abre modal de Nuevo grupo", () => {
    renderComponent();
    const actions = screen.getAllByRole("button");
    const newGroupBtn = screen.getByText("Crear Grupo");
    fireEvent.click(newGroupBtn);
    expect(mockSetModal).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, title: "Nuevo Grupo" })
    );
  });

  it("navega a /tasks al dar Ver Grupos", () => {
    renderComponent();
    const verGruposBtn = screen.getByText("Ver Grupos");
    fireEvent.click(verGruposBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/tasks", { state: { goTo: "wg" } });
  });

  it("cierra menu movil al clickear enlinks", () => {
    renderComponent(true);
    fireEvent.click(screen.getByText("T&G"));
    expect(onCloseMobileMenu).toHaveBeenCalled();
  });

  it("togglea el estado colapsado del sidebar", () => {
    mockIsSidebarCollapsed = false;
    renderComponent();

    const toggleButton = screen.getAllByRole("button")[0];
    fireEvent.click(toggleButton);

    expect(mockSetIsSidebarCollapsed).toHaveBeenCalledWith(true);
  });

  it("permite navegar a tareas por grupo haciendo click en icono y nombre", () => {
    renderComponent(true);

    fireEvent.click(screen.getByText("E"));
    expect(mockNavigate).toHaveBeenCalledWith("/tasksbygroup", { state: { wg: expect.objectContaining({ key: "wg1" }) } });
    expect(onCloseMobileMenu).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Equipo alpha"));
    expect(mockNavigate).toHaveBeenCalledWith("/tasksbygroup", { state: { wg: expect.objectContaining({ key: "wg1" }) } });
  });

  it("muestra sin asignación para usuario sin grupos visibles", () => {
    mockUser = { permissions: ["TYG"], workgroupKeys: ["none"] };
    mockWorkgroups = [
      {
        id: "x1",
        key: "private1",
        name: "Privado",
        isActive: true,
        isPrivate: true,
        color: "#123456",
        memberKeys: [],
        createdDate: 0,
      },
    ];

    renderComponent();
    expect(screen.getByText("Sin asignación")).toBeInTheDocument();
  });

  it("abre modal al crear nuevo grupo desde acciones secundarias", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Nuevo grupo" }));

    expect(mockSetModal).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        title: "Nuevo Grupo",
      })
    );
  });

  it("abre modal para nueva tarea y modificar desde acciones de grupo", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Nueva Tarea" }));
    expect(mockSetModal).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        title: "Nueva Tarea",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Modificar" }));
    expect(mockSetModal).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        title: "Modificar Grupo",
      })
    );
  });

  it("elimina grupo correctamente y muestra snackbar success", async () => {
    (WorkgroupService.deleteWorkgroup as jest.Mock).mockResolvedValueOnce({ result: "OK" });
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const confirmationPayload = mockSetConfirmation.mock.calls[0][0];
    const actionView = render(confirmationPayload.actions);
    fireEvent.click(within(actionView.container).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(WorkgroupService.deleteWorkgroup).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/home");
      expect(mockSetConfirmation).toHaveBeenCalledWith({ open: false });
    });
  });

  it("maneja error al eliminar grupo y cierra confirmación", async () => {
    (WorkgroupService.deleteWorkgroup as jest.Mock).mockRejectedValueOnce(new Error("boom"));
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const confirmationPayload = mockSetConfirmation.mock.calls[0][0];
    const actionView = render(confirmationPayload.actions);
    fireEvent.click(within(actionView.container).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", message: "Error eliminando grupo!" })
      );
      expect(mockSetConfirmation).toHaveBeenCalledWith({ open: false });
    });
  });
});
