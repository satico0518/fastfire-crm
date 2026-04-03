import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CalendarGridView } from "../CalendarGridView";

jest.mock("../ScheduleDetailModal", () => ({
  ScheduleDetailModal: ({ open }: { open: boolean }) => <div>ScheduleDetail:{String(open)}</div>,
}));

describe("CalendarGridView", () => {
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
    expect(screen.getByText("LUN")).toBeInTheDocument();
  });

  test("muestra agendamiento y abre detalle al hacer click", () => {
    render(
      <CalendarGridView
        isAdmin
        onOpenCreation={jest.fn()}
        schedules={[
          {
            id: "1",
            projectName: "Proyecto A",
            title: "Actividad A",
            dateStr: new Date().toISOString(),
            status: "SCHEDULED",
            type: "MAINTENANCE",
          } as any,
        ]}
      />
    );

    fireEvent.click(screen.getByText("Proyecto A"));
    expect(screen.getByText("ScheduleDetail:true")).toBeInTheDocument();
  });
});
