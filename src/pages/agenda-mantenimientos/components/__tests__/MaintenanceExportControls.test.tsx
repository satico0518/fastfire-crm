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
});
