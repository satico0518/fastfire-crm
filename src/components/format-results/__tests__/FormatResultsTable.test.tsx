  test("exporta a PDF exitosamente", async () => {
    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText("Formato Demo"));
    const pdfButton = screen.getByLabelText("PDF");
    fireEvent.click(pdfButton);
    await waitFor(() => expect(mockExportPdf).toHaveBeenCalled());
    expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("PDF generado exitosamente") }));
  });

  test("muestra error al exportar PDF", async () => {
    mockExportPdf.mockImplementationOnce(() => { throw new Error("fail"); });
    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText("Formato Demo"));
    const pdfButton = screen.getByLabelText("PDF");
    fireEvent.click(pdfButton);
    await waitFor(() => expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Error al generar PDF") })));
  });

  test("permite rechazar un envío", async () => {
    mockReviewSubmission.mockResolvedValue({ result: "OK", message: "ok" });
    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText("Formato Demo"));
    fireEvent.click(screen.getByRole("grid").querySelector("tr") as HTMLElement);
    fireEvent.click(screen.getByText("Rechazar"));
    await waitFor(() => expect(mockReviewSubmission).toHaveBeenCalled());
  });

  test("visualiza y cierra el diálogo de detalles", async () => {
    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText("Formato Demo"));
    fireEvent.click(screen.getByRole("grid").querySelector("tr") as HTMLElement);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cerrar"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("descarga imagen correctamente", () => {
    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText("Formato Demo"));
    fireEvent.click(screen.getByRole("grid").querySelector("tr") as HTMLElement);
    // Esperar a que el diálogo esté abierto
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Buscar el botón de descarga de imagen por aria-label
    const downloadBtn = screen.getByLabelText("Descargar imagen");
    expect(downloadBtn).toBeInTheDocument();
    // Simular click (el resto del flujo depende de mocks de window)
  });
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormatResultsTable } from "../FormatResultsTable";

const mockReviewSubmission = jest.fn();
const mockSetSnackbar = jest.fn();
const mockDownloadExcel = jest.fn();
const mockExportPdf = jest.fn();


const mockSubmissions = [
  {
    key: "s1",
    formatTypeId: "LEGALIZACION_CUENTAS",
    formatTypeName: "Formato Demo",
    status: "SUBMITTED",
    createdByUserKey: "u1",
    createdDate: Date.now(),
    updatedDate: Date.now(),
    reviewNotes: "",
    isPublicSubmission: false,
    data: { campo_a: "valor a", imagen: "data:image/png;base64,AAA" },
  },
];

jest.mock("@mui/x-data-grid", () => ({
  DataGrid: ({ rows, columns, onRowClick }: any) => (
    <table role="grid">
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.key} onClick={() => onRowClick?.({ row })}>
            {columns.map((col: any) => (
              <td key={col.field}>
                {col.renderCell
                  ? col.renderCell({ row })
                  : String(row[col.field] || "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

jest.mock("../../../stores/formats/formats.store", () => ({
  useFormatsStore: jest.fn((selector) =>
    selector ? selector({ submissions: mockSubmissions }) : { submissions: mockSubmissions }
  ),
}));

jest.mock("../../../stores/users/users.store", () => ({
  useUsersStore: jest.fn((selector) =>
    selector
      ? selector({ users: [{ key: "u1", firstName: "Juan", lastName: "Perez" }] })
      : { users: [{ key: "u1", firstName: "Juan", lastName: "Perez" }] }
  ),
}));

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) =>
    selector ? selector({ user: { key: "u1", permissions: ["ADMIN"] } }) : { user: { key: "u1", permissions: ["ADMIN"] } }
  ),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector ? selector({ setSnackbar: mockSetSnackbar }) : { setSnackbar: mockSetSnackbar }
  ),
}));

jest.mock("../../../services/format.service", () => ({
  FormatService: {
    reviewSubmission: (...args: unknown[]) => mockReviewSubmission(...args),
  },
}));

jest.mock("../../../config/formatCatalog", () => ({
  FORMAT_CATALOG: [
    {
      id: "LEGALIZACION_CUENTAS",
      name: "Formato Demo",
      description: "Formato de prueba",
      fields: [
        { name: "campo_a", label: "Campo A", type: "text" },
        { name: "imagen", label: "Imagen", type: "text" },
      ],
    },
  ],
  getFormatTypeById: () => ({
    id: "LEGALIZACION_CUENTAS",
    name: "Formato Demo",
    fields: [
      { name: "campo_a", label: "Campo A", type: "text" },
      { name: "imagen", label: "Imagen", type: "text" },
    ],
  }),
}));

jest.mock("../../../config/formatColumns", () => ({
  getColumnsForFormat: () => [
    { field: "status", headerName: "Estado" },
    { field: "imagen", headerName: "Imagen", type: "text" },
  ],
}));

jest.mock("../../../utils/utils", () => ({
  getUserNameByKey: () => "Juan Perez",
  translateTimestampToString: () => "01/01/2025",
  downloadExcelFile: (...args: unknown[]) => mockDownloadExcel(...args),
  exportSubmissionToPDF: (...args: unknown[]) => mockExportPdf(...args),
}));

describe("FormatResultsTable", () => {
  beforeEach(() => {
    mockReviewSubmission.mockReset();
    mockSetSnackbar.mockReset();
    mockDownloadExcel.mockReset();
    mockExportPdf.mockReset();
  });

  test("muestra selector de formatos y permite entrar a resultados", () => {
    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText("Formato Demo"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("Excel")).toBeInTheDocument();
  });

  test("exporta a excel y revisa envío", async () => {
    mockReviewSubmission.mockResolvedValue({ result: "OK", message: "ok" });
    render(<FormatResultsTable />);

    fireEvent.click(screen.getByText("Formato Demo"));
    fireEvent.click(screen.getByText("Excel"));
    expect(mockDownloadExcel).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("grid").querySelector("tr") as HTMLElement);
    fireEvent.click(screen.getByText("Aprobar"));

    await waitFor(() => expect(mockReviewSubmission).toHaveBeenCalled());
  });
});
