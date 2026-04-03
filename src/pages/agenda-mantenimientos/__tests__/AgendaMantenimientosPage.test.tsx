import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgendaMantenimientosPage } from "../AgendaMantenimientosPage";

const mockNavigate = jest.fn();
const mockSubscribe = jest.fn();
const mockSetSnackbar = jest.fn();

let mockAuthState: any = {
  user: { id: "u1", permissions: ["PLANNER"] },
};

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) => (selector ? selector(mockAuthState) : mockAuthState)),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector ? selector({ setSnackbar: mockSetSnackbar }) : { setSnackbar: mockSetSnackbar }
  ),
}));

jest.mock("../../../services/maintenance.service", () => ({
  MaintenanceService: {
    subscribeToSchedules: (...args: unknown[]) => mockSubscribe(...args),
    createSchedule: jest.fn(),
  },
}));

jest.mock("../components/ScheduleDayBlock", () => ({
  ScheduleDayBlock: ({ dateLabel }: { dateLabel: string }) => <div>DayBlock:{dateLabel}</div>,
}));

jest.mock("../components/CalendarGridView", () => ({
  CalendarGridView: () => <div>Calendar grid mock</div>,
}));

jest.mock("../components/ScheduleCreationModal", () => ({
  ScheduleCreationModal: ({ open }: { open: boolean }) => <div>CreationModal:{String(open)}</div>,
}));

jest.mock("../components/MaintenanceExportControls", () => ({
  MaintenanceExportControls: () => <div>Export controls mock</div>,
}));

jest.mock("../../unauthorized/UnauthorizedPage", () => ({
  UnauthorizedPage: () => <div>Unauthorized mock</div>,
}));

describe("AgendaMantenimientosPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetSnackbar.mockReset();
    mockSubscribe.mockReset();
  });

  test("muestra unauthorized cuando usuario no tiene permisos", () => {
    mockAuthState = { user: { permissions: ["USER"] } };
    render(<AgendaMantenimientosPage />);
    expect(screen.getByText("Unauthorized mock")).toBeInTheDocument();
  });

  test("renderiza agenda y datos suscritos cuando usuario está autorizado", async () => {
    mockAuthState = { user: { id: "u1", permissions: ["PLANNER"] } };
    mockSubscribe.mockImplementation((cb: (data: any[]) => void) => {
      cb([
        {
          id: "1",
          dateStr: "2099-01-01T10:00:00.000Z",
          type: "MAINTENANCE",
          status: "SCHEDULED",
          title: "Mtto 1",
        },
      ]);
      return jest.fn();
    });

    render(<AgendaMantenimientosPage />);

    await waitFor(() => expect(screen.getAllByText("Agenda").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Export controls mock").length).toBeGreaterThan(0);
    expect(screen.getByText("Calendar grid mock")).toBeInTheDocument();
  });
});
