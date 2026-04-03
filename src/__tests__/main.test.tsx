import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Main } from "../main";
import { useUiStore } from "../stores/ui/ui.store";

jest.mock("../App.tsx", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "app-mock" }, "App"),
  };
});

jest.mock("../components/header/HeaderComponent.tsx", () => ({
  Header: ({
    onToggleMobileMenu,
  }: {
    onToggleMobileMenu?: () => void;
  }) => (
    <div data-testid="header-mock">
      <button type="button" onClick={onToggleMobileMenu}>
        toggle-mobile-menu
      </button>
    </div>
  ),
}));

jest.mock("../components/menu/MenuComponent.tsx", () => ({
  MenuComponent: ({
    onCloseMobileMenu,
  }: {
    onCloseMobileMenu?: () => void;
  }) => (
    <div data-testid="menu-mock">
      <button type="button" onClick={onCloseMobileMenu}>
        close-mobile-menu
      </button>
    </div>
  ),
}));

jest.mock("../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector: (s: { isSidebarCollapsed: boolean }) => unknown) =>
    selector({ isSidebarCollapsed: false })
  ),
}));

const mockUseUiStore = useUiStore as jest.MockedFunction<typeof useUiStore>;

const mockUiState = {
  isLoading: false,
  setIsLoading: jest.fn(),
  modal: { open: false, title: "", content: null },
  setModal: jest.fn(),
  snackbar: { open: false, message: "", duration: 4000, severity: "info" as const },
  setSnackbar: jest.fn(),
  confirmation: { open: false, title: "", text: "", actions: null },
  setConfirmation: jest.fn(),
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: jest.fn(),
};

describe("Main", () => {
  beforeEach(() => {
    mockUseUiStore.mockImplementation((selector) =>
      selector({ ...mockUiState, isSidebarCollapsed: false })
    );
  });

  it("renderiza Header, menú y App", () => {
    const { container } = render(<Main />);

    expect(screen.getByTestId("header-mock")).toBeInTheDocument();
    expect(screen.getByTestId("menu-mock")).toBeInTheDocument();
    expect(screen.getByTestId("app-mock")).toBeInTheDocument();
    expect(
      container.querySelector(".body-container--collapsed")
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".mobile-menu-overlay")
    ).not.toBeInTheDocument();
  });

  it("muestra overlay al abrir menú móvil y lo cierra al pulsar overlay o desde el menú", async () => {
    const user = userEvent.setup();
    render(<Main />);

    await user.click(screen.getByRole("button", { name: "toggle-mobile-menu" }));
    const overlay = document.querySelector(".mobile-menu-overlay");
    expect(overlay).toBeInTheDocument();

    await user.click(overlay!);
    expect(document.querySelector(".mobile-menu-overlay")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "toggle-mobile-menu" }));
    expect(document.querySelector(".mobile-menu-overlay")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "close-mobile-menu" }));
    expect(document.querySelector(".mobile-menu-overlay")).not.toBeInTheDocument();
  });

  it("aplica body-container--collapsed cuando el sidebar está colapsado", () => {
    mockUseUiStore.mockImplementation((selector) =>
      selector({ ...mockUiState, isSidebarCollapsed: true })
    );
    const { container } = render(<Main />);

    expect(container.querySelector(".body-container--collapsed")).toBeInTheDocument();
  });
});
