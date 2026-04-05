import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormatResultsTable } from "../FormatResultsTable";
import { FormatService } from "../../../services/format.service";
import * as utils from "../../../utils/utils";

jest.mock("../../../services/format.service", () => ({
  FormatService: {
    reviewSubmission: jest.fn(),
  },
}));

const mockExportPDF = jest.fn().mockResolvedValue(undefined);
const mockDownloadExcel = jest.fn();

jest.mock("../../../utils/utils", () => ({
  __esModule: true,
  ...jest.requireActual("../../../utils/utils"),
  exportSubmissionToPDF: (...args: any[]) => mockExportPDF(...args),
  downloadExcelFile: (...args: any[]) => mockDownloadExcel(...args)
}));

jest.mock("../../../config/formatCatalog", () => ({
  ...jest.requireActual("../../../config/formatCatalog"),
  getFormatTypeById: jest.fn().mockImplementation((id) => {
    if (id === "ACTA_ENTREGA") return {
      id: "ACTA_ENTREGA",
      name: "Acta de Entrega",
      fields: [
        { name: "imgField", label: "Image Field", type: "text" },
        { name: "tagsField", label: "Tags Field", type: "tags" }
      ]
    };
    return { id, name: id, fields: [] };
  }),
  FORMAT_CATALOG: [{ id: "ACTA_ENTREGA", name: "Acta de Entrega", fields: [] }]
}));

let mockSubmissions = [
  {
    key: "sub1",
    formatTypeId: "ACTA_ENTREGA",
    status: "SUBMITTED",
    createdByUserKey: "u1",
    createdDate: 123456789,
    data: {
      field1: "test",
      imgField: "https://res.cloudinary.com/demo/image/upload/v1544439009/sample.jpg",
      arrField: [
        { sub1: "val", sub2: 2 }
      ],
      tagsField: ["tagA", "tagB"]
    }
  },
  {
    key: "sub2",
    formatTypeId: "ACTA_ENTREGA",
    status: "REVIEWED",
    createdByUserKey: "PUBLIC",
    createdDate: 123456789,
    reviewNotes: "Looks good",
    data: {
      calc: [
        { val: 100 },
        { val: 200 }
      ]
    }
  }
];

jest.mock("../../../stores/formats/formats.store", () => ({
  useFormatsStore: jest.fn((selector) =>
    selector({
      submissions: mockSubmissions,
    })
  ),
}));

jest.mock("../../../stores/users/users.store", () => ({
  useUsersStore: jest.fn((selector) =>
    selector({
      users: [{ key: "u1", firstName: "Davo", lastName: "Gomez" }],
    })
  ),
}));

const mockSetSnackbar = jest.fn();
jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      setSnackbar: mockSetSnackbar,
    })
  ),
}));

let mockUser: any = { key: "u1" };
jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) =>
    selector({
      user: mockUser,
    })
  ),
}));

describe("FormatResultsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza correctamente las tarjetas resumen", () => {
    render(<FormatResultsTable />);
    // Hay "Acta de Entrega" o el nombre mapeado por ACTA_ENTREGA en el mock del catálogo
    expect(screen.getByText(/Selecciona un formato/i)).toBeInTheDocument();
  });

  it("selecciona un formato e interactua con tabla", async () => {
    const { FORMAT_CATALOG } = require("../../../config/formatCatalog");
    // Buscamos el nombre del formato ACTA_ENTREGA
    const formatName = FORMAT_CATALOG.find((f: any) => f.id === "ACTA_ENTREGA").name;

    render(<FormatResultsTable />);
    fireEvent.click(screen.getByText(formatName));

    // Deberiamos estar en la tabla
    expect(screen.getByTestId("ArrowBackIcon")).toBeInTheDocument();

    const viewBtns = screen.getAllByTestId("VisibilityIcon");
    fireEvent.click(viewBtns[0].parentElement!);

    expect(screen.getByText("Aprobar")).toBeInTheDocument();
    expect(screen.getByText("Rechazar")).toBeInTheDocument();

    // Ver Notas del revisor (Añadir)
    const tb = screen.getByRole("textbox");
    fireEvent.change(tb, { target: { value: "Please change X" } });

    (FormatService.reviewSubmission as jest.Mock).mockResolvedValueOnce({ result: "OK", message: "Aprobado" });
    fireEvent.click(screen.getByText("Aprobar"));

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" })
      );
    });
  });

  it("falla review", async () => {
    const { FORMAT_CATALOG } = require("../../../config/formatCatalog");
    render(<FormatResultsTable />);
    const formatName = FORMAT_CATALOG.find((f: any) => f.id === "ACTA_ENTREGA").name;
    fireEvent.click(screen.getByText(formatName));
    
    const viewBtns = screen.getAllByTestId("VisibilityIcon");
    fireEvent.click(viewBtns[0].parentElement!);

    (FormatService.reviewSubmission as jest.Mock).mockResolvedValueOnce({ result: "ERROR", errorMessage: "Bad" });
    fireEvent.click(screen.getByText("Rechazar"));

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });

  it("exporta a PDF", async () => {
    const { FORMAT_CATALOG } = require("../../../config/formatCatalog");
    render(<FormatResultsTable />);
    const formatName = FORMAT_CATALOG.find((f: any) => f.id === "ACTA_ENTREGA").name;
    fireEvent.click(screen.getByText(formatName));
    
    const pdfBtns = screen.getAllByTestId("PictureAsPdfIcon");
    fireEvent.click(pdfBtns[0].parentElement!);

    await waitFor(() => {
      expect(mockExportPDF).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ message: "PDF generado exitosamente" })
      );
    });
  });

  it("falla al exportar a PDF", async () => {
    mockExportPDF.mockRejectedValueOnce(new Error("Net error"));
    const { FORMAT_CATALOG } = require("../../../config/formatCatalog");
    render(<FormatResultsTable />);
    const formatName = FORMAT_CATALOG.find((f: any) => f.id === "ACTA_ENTREGA").name;
    fireEvent.click(screen.getByText(formatName));
    
    const pdfBtns = screen.getAllByTestId("PictureAsPdfIcon");
    fireEvent.click(pdfBtns[0].parentElement!);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });

  it("exporta a excel csv", async () => {
    const { FORMAT_CATALOG } = require("../../../config/formatCatalog");
    render(<FormatResultsTable />);
    const formatName = FORMAT_CATALOG.find((f: any) => f.id === "ACTA_ENTREGA").name;
    fireEvent.click(screen.getByText(formatName));

    const exportBtn = screen.getByTestId("DownloadIcon").parentElement;
    if (exportBtn) fireEvent.click(exportBtn);

    expect(mockDownloadExcel).toHaveBeenCalled();
  });

  it("descarga imagen en renderFieldValue", async () => {
    const { FORMAT_CATALOG } = require("../../../config/formatCatalog");
    render(<FormatResultsTable />);
    const formatName = FORMAT_CATALOG.find((f: any) => f.id === "ACTA_ENTREGA").name;
    fireEvent.click(screen.getByText(formatName));
    
    const viewBtns = screen.getAllByTestId("VisibilityIcon");
    fireEvent.click(viewBtns[0].parentElement!);

    const downloadBtn = screen.getByRole("button", { name: "Descargar imagen" });
    fireEvent.click(downloadBtn);
    
    expect(mockSetSnackbar).toHaveBeenCalledWith(
       expect.objectContaining({ message: "Descargando imagen..." })
    );

  });
});
