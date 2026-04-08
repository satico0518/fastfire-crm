import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MaintenanceExportControls } from "../MaintenanceExportControls";

const mockDownloadExcel = jest.fn();
const mockSetSnackbar = jest.fn();

jest.mock("../../../../utils/utils", () => ({
  downloadExcelFile: (...args: unknown[]) => mockDownloadExcel(...args),
}));

describe("MaintenanceExportControls", () => {
  beforeEach(() => {
    mockDownloadExcel.mockReset();
    mockSetSnackbar.mockReset();
  });

  test("avisa cuando no hay datos en los meses seleccionados", () => {
    render(<MaintenanceExportControls schedules={[]} setSnackbar={mockSetSnackbar} />);
    fireEvent.click(screen.getByText("Exportar"));
    fireEvent.click(screen.getByRole("button", { name: /todo/i }));
    fireEvent.click(screen.getByText("Descargar Excel"));
    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" })
    );
  });

  test("exporta excel al seleccionar meses con datos", () => {
    render(
      <MaintenanceExportControls
        setSnackbar={mockSetSnackbar}
        schedules={[
          {
            id: "1",
            projectName: "Proyecto A",
            title: "Actividad",
            dateStr: "2099-01-10T10:00:00.000Z",
            address: "Dir 1",
            status: "SCHEDULED",
            priority: "NORMAL",
            createdAt: "2099-01-01T00:00:00.000Z",
          } as any,
        ]}
      />
    );

    fireEvent.click(screen.getByText("Exportar"));
    fireEvent.click(screen.getByRole("button", { name: /todo/i }));
    fireEvent.click(screen.getByText("Descargar Excel"));

    expect(mockDownloadExcel).toHaveBeenCalled();
    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" })
    );
  });

  test("permite seleccionar y deseleccionar meses manualmente", () => {
    render(
      <MaintenanceExportControls
        setSnackbar={mockSetSnackbar}
        schedules={[
          {
            id: "1",
            projectName: "Proyecto Toggle",
            title: "Actividad Toggle",
            dateStr: "2099-01-10T10:00:00.000Z",
            address: "Dir Toggle",
            status: "SCHEDULED",
            priority: "NORMAL",
            createdAt: "2099-01-01T00:00:00.000Z",
          } as any,
        ]}
      />
    );

    fireEvent.click(screen.getByText("Exportar"));
    const firstCheckbox = screen.getAllByRole("checkbox")[0];

    fireEvent.click(firstCheckbox);
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(firstCheckbox);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  test("Todo y Limpiar alternan selección completa", () => {
    render(<MaintenanceExportControls schedules={[]} setSnackbar={mockSetSnackbar} />);

    fireEvent.click(screen.getByText("Exportar"));
    const actionButton = screen.getByRole("button", { name: /todo|limpiar/i });

    fireEvent.click(actionButton);
    expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /limpiar/i }));
    expect(screen.getByRole("button", { name: /todo/i })).toBeInTheDocument();
  });

  test("deshabilita descarga cuando no hay meses seleccionados", () => {
    render(
      <MaintenanceExportControls
        setSnackbar={mockSetSnackbar}
        schedules={[
          {
            id: "1",
            projectName: "Proyecto Warning",
            title: "Actividad Warning",
            dateStr: "2099-02-10T10:00:00.000Z",
            address: "Dir 1",
            status: "SCHEDULED",
            priority: "LOW",
            createdAt: "2099-02-01T00:00:00.000Z",
          } as any,
        ]}
      />
    );

    fireEvent.click(screen.getByText("Exportar"));
    fireEvent.click(screen.getByRole("button", { name: /todo/i }));
    fireEvent.click(screen.getByRole("button", { name: /limpiar/i }));

    expect(screen.getByRole("button", { name: "Descargar Excel" })).toBeDisabled();
  });

  test("exporta mapeando estados y prioridades en todos los casos", () => {
    render(
      <MaintenanceExportControls
        setSnackbar={mockSetSnackbar}
        schedules={[
          {
            id: "1",
            projectName: "Proyecto 1",
            title: "Actividad 1",
            dateStr: "2099-01-10T10:00:00.000Z",
            address: "Dir 1",
            status: "SCHEDULED",
            priority: "LOW",
            createdAt: "2099-01-01T00:00:00.000Z",
          } as any,
          {
            id: "2",
            projectName: "Proyecto 2",
            title: "Actividad 2",
            dateStr: "2099-01-11T11:00:00.000Z",
            address: "Dir 2",
            status: "IN_PROGRESS",
            priority: "NORMAL",
            createdAt: "2099-01-01T00:00:00.000Z",
          } as any,
          {
            id: "3",
            projectName: "Proyecto 3",
            title: "Actividad 3",
            dateStr: "2099-01-12T12:00:00.000Z",
            address: "Dir 3",
            status: "COMPLETED",
            priority: "HIGH",
            createdAt: "2099-01-01T00:00:00.000Z",
          } as any,
          {
            id: "4",
            projectName: "Proyecto 4",
            title: "Actividad 4",
            dateStr: "2099-01-13T13:00:00.000Z",
            address: "Dir 4",
            status: "CANCELLED",
            priority: "URGENT",
            createdAt: "2099-01-01T00:00:00.000Z",
          } as any,
        ]}
      />
    );

    fireEvent.click(screen.getByText("Exportar"));
    fireEvent.click(screen.getByRole("button", { name: /todo/i }));
    fireEvent.click(screen.getByText("Descargar Excel"));

    expect(mockDownloadExcel).toHaveBeenCalled();
    const exportedRows = mockDownloadExcel.mock.calls[0][0] as Array<Record<string, string>>;

    expect(exportedRows.map((row) => row["Estado"]).sort()).toEqual([
      "Agendado",
      "Cancelado",
      "Completado",
      "En Progreso",
    ]);
    expect(exportedRows.map((row) => row["Prioridad"]).sort()).toEqual([
      "Alta",
      "Baja",
      "Normal",
      "Urgente",
    ]);

    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" })
    );
  });
});
