import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CalendarGridView } from "../CalendarGridView";
import { useMediaQuery } from "@mui/material";

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

jest.mock("../ScheduleDetailModal", () => ({
  ScheduleDetailModal: ({ open, onClose, onEdit, schedule }: { open: boolean; onClose: () => void; onEdit?: (schedule: unknown) => void; schedule: unknown }) => (
    <div>
      <span>ScheduleDetail:{String(open)}</span>
      <button type="button" onClick={onClose}>Cerrar detalle</button>
      <button type="button" onClick={() => onEdit?.(schedule)}>Editar detalle</button>
    </div>
  ),
}));

describe("CalendarGridView", () => {
  beforeEach(() => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2099-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renderiza cabecera de mes y permite abrir creación", () => {
    const onOpenCreation = jest.fn();
    render(
      <CalendarGridView
        isAdmin
        schedules={[]}
        onOpenCreation={onOpenCreation}
      />
    );

    expect(screen.getByText("HOY")).toBeInTheDocument();
    fireEvent.click(screen.getByText("HOY"));

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[2]);

    expect(screen.getByText("LUN")).toBeInTheDocument();
  });

  test("muestra agendamiento y abre detalle al hacer click", () => {
    const onEdit = jest.fn();
    const onOpenCreation = jest.fn();

    render(
      <CalendarGridView
        isAdmin
        onOpenCreation={onOpenCreation}
        onEdit={onEdit}
        schedules={[
          {
            id: "1",
            projectName: "Proyecto A",
            title: "Actividad A",
            dateStr: new Date().toISOString(),
            status: "CANCELLED",
            type: "MAINTENANCE",
          } as any,
          {
            id: "2",
            projectName: "Proyecto B",
            title: "Actividad B",
            dateStr: new Date().toISOString(),
            status: "IN_PROGRESS",
            type: "MAINTENANCE",
          } as any,
          {
            id: "3",
            projectName: "Proyecto C",
            title: "Actividad C",
            dateStr: new Date().toISOString(),
            status: "COMPLETED",
            type: "MAINTENANCE",
          } as any,
          {
            id: "4",
            projectName: "Proyecto M",
            title: "Actividad manager",
            dateStr: new Date().toISOString(),
            status: "SCHEDULED",
            type: "MANAGER_ACTIVITY",
          } as any,
          {
            id: "5",
            projectName: "Proyecto Otro Mes",
            title: "Fuera de mes",
            dateStr: "2099-03-01T10:00:00.000Z",
            status: "SCHEDULED",
            type: "MAINTENANCE",
          } as any,
          {
            id: "6",
            projectName: "Proyecto Estado Default",
            title: "Estado desconocido",
            dateStr: new Date().toISOString(),
            status: "UNKNOWN_STATUS",
            type: "MAINTENANCE",
          } as any,
        ]}
      />
    );

    fireEvent.click(screen.getByText("Proyecto A"));
    expect(screen.getByText("ScheduleDetail:true")).toBeInTheDocument();
    expect(onOpenCreation).not.toHaveBeenCalled();
    expect(screen.getByTestId("PersonIcon")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar detalle" }));
    expect(onEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle" }));
    expect(screen.queryByText("ScheduleDetail:true")).not.toBeInTheDocument();
    expect(screen.queryByText("Proyecto Otro Mes")).not.toBeInTheDocument();
    expect(screen.getByText("Proyecto Estado Default")).toBeInTheDocument();
  });

  test("permite abrir creación en día futuro para admin y bloquea en día pasado", () => {
    const onOpenCreation = jest.fn();
    render(<CalendarGridView isAdmin schedules={[]} onOpenCreation={onOpenCreation} />);

    fireEvent.click(screen.getByText("16"));
    expect(onOpenCreation).toHaveBeenCalledWith("2099-01-16");

    fireEvent.click(screen.getByText("14"));
    expect(onOpenCreation).toHaveBeenCalledTimes(1);
  });

  test("no abre creación cuando no es admin", () => {
    const onOpenCreation = jest.fn();
    render(<CalendarGridView schedules={[]} onOpenCreation={onOpenCreation} isAdmin={false} />);

    fireEvent.click(screen.getByText("16"));
    expect(onOpenCreation).not.toHaveBeenCalled();
  });

  test("muestra estado vacío en mobile", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    render(<CalendarGridView isAdmin schedules={[]} onOpenCreation={jest.fn()} />);

    expect(screen.getAllByText("sin agendamiento").length).toBeGreaterThan(0);
  });

  test("desuscribe listener de resize al desmontar", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<CalendarGridView isAdmin schedules={[]} onOpenCreation={jest.fn()} />);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    removeSpy.mockRestore();
  });
});
