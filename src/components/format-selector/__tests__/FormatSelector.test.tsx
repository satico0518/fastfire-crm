import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormatSelector } from "../FormatSelector";

const mockCreateSubmission = jest.fn();
const mockSetSnackbar = jest.fn();
const mockSetIsLoading = jest.fn();

let mockAuthState: any = {
  user: {
    key: "u1",
    firstName: "Juan",
    lastName: "Perez",
    permissions: ["ADMIN"],
  },
};

jest.mock("../../../config/formatCatalog", () => ({
  FORMAT_CATALOG: [
    {
      id: "LEGALIZACION_CUENTAS",
      name: "Formato Demo",
      description: "Formato de prueba",
      fields: [],
    },
  ],
}));

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) => (selector ? selector(mockAuthState) : mockAuthState)),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector
      ? selector({ setSnackbar: mockSetSnackbar, setIsLoading: mockSetIsLoading })
      : { setSnackbar: mockSetSnackbar, setIsLoading: mockSetIsLoading }
  ),
}));

jest.mock("../../../services/format.service", () => ({
  FormatService: {
    createSubmission: (...args: unknown[]) => mockCreateSubmission(...args),
  },
}));

describe("FormatSelector", () => {
  beforeEach(() => {
    mockCreateSubmission.mockReset();
    mockSetSnackbar.mockReset();
    mockSetIsLoading.mockReset();
    mockAuthState = {
      user: {
        key: "u1",
        firstName: "Juan",
        lastName: "Perez",
        permissions: ["ADMIN"],
      },
    };
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  test("copia enlace público y muestra snackbar", async () => {
    render(<FormatSelector />);
    fireEvent.click(screen.getByTitle("Copiar enlace público"));

    await waitFor(() =>
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ open: true, severity: "success" })
      )
    );
  });

  test("abre el formulario y envía formato exitosamente", async () => {
    mockCreateSubmission.mockResolvedValue({ result: "OK" });
    render(<FormatSelector />);

    fireEvent.click(screen.getByText("Formato Demo"));
    fireEvent.click(screen.getByText("Enviar"));

    await waitFor(() => expect(mockCreateSubmission).toHaveBeenCalled());
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" })
    );
  });
});
