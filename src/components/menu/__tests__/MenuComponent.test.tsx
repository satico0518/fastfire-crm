import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { MenuComponent } from "../MenuComponent";

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) =>
    selector({
      isAuth: true,
      hasHydrated: true,
      user: {
        key: "u1",
        permissions: ["ADMIN", "PLANNER"],
        workgroupKeys: ["wg1"],
      },
    })
  ),
}));

jest.mock("../../../stores/workgroups/workgroups.store", () => ({
  useWorkgroupStore: jest.fn((selector) =>
    selector({
      workgroups: [
        {
          id: "1",
          key: "wg1",
          name: "Equipo Alpha",
          isActive: true,
          isPrivate: false,
          color: "#4CAF50",
          memberKeys: [],
          createdDate: Date.now(),
        },
      ],
    })
  ),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: jest.fn(),
      setModal: jest.fn(),
      modal: { open: false, title: "", content: null },
      setConfirmation: jest.fn(),
      setSnackbar: jest.fn(),
    })
  ),
}));

jest.mock("../../../stores/tasks/tasks.store", () => ({
  useTasksStore: jest.fn((selector) => selector({ tasks: [] })),
}));

jest.mock("../../../stores/users/users.store", () => ({
  useUsersStore: jest.fn((selector) => selector({ users: [] })),
}));

describe("MenuComponent", () => {
  it("renderiza enlaces principales para ADMIN", () => {
    render(
      <MemoryRouter>
        <MenuComponent isMobileMenuOpen={false} onCloseMobileMenu={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("T&G")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Formatos")).toBeInTheDocument();
    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });
});
