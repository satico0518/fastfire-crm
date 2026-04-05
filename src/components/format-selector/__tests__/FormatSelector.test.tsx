import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormatSelector } from "../FormatSelector";
import { FormatService } from "../../../services/format.service";
import userEvent from "@testing-library/user-event";

jest.mock("../../../services/format.service", () => ({
  FormatService: {
    createSubmission: jest.fn(),
  },
}));

let mockUser: any = { key: "u1", firstName: "Test" };
let mockSetSnackbar = jest.fn();
let mockSetIsLoading = jest.fn();

jest.mock("../../../stores", () => ({
  useAuhtStore: jest.fn((selector) =>
    selector({
      user: mockUser,
    })
  ),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      setSnackbar: mockSetSnackbar,
      setIsLoading: mockSetIsLoading,
    })
  ),
}));

jest.mock("../../signature-pad/SignaturePadField", () => ({
  __esModule: true,
  SignaturePadField: ({ value, onChange, label }: any) => (
    <div data-testid="mock-signature-pad">
      <label>{label}</label>
      <input
        type="text"
        role="textbox"
        name="signature-mock"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

// Provide a mock format catalog
jest.mock("../../../config/formatCatalog", () => ({
  FORMAT_CATALOG: [
    {
      id: "ACTA_ENTREGA",
      name: "Formato de Prueba",
      description: "Prueba de formato",
      fields: [
        { name: "text_field", label: "Texto", type: "text", required: false },
        { name: "number_field", label: "Numero", type: "number", required: false },
        { name: "textarea_field", label: "Area", type: "textarea", required: false },
        { name: "select_field", label: "Select", type: "select", options: ["A", "B"], required: false },
        { name: "switch_field", label: "Switch", type: "switch", options: ["SI", "NO"], required: false },
        { name: "checkbox_field", label: "Check", type: "checkbox-group", options: ["Op1", "Op2"], required: false },
        { name: "date_field", label: "Fecha", type: "date", required: false },
        { name: "datetime_field", label: "FechaTiempo", type: "datetime", required: false },
        { name: "sig_field", label: "Firma", type: "signature", required: false },
        { name: "header_field", label: "Cabecera", type: "header", required: false },
        {
          name: "dynamic_group",
          label: "Grupo Dinamico",
          type: "dynamic-group",
          required: false,
          subFields: [
            { name: "sub_text", label: "Sub Text", type: "text" },
            { name: "sub_num", label: "Sub Num", type: "number" },
          ],
        },
        {
          name: "calc_sum",
          label: "Suma Calculada",
          type: "calculated-sum",
          calculateSum: "dynamic_group.sub_num",
          required: false
        },
        {
          name: "sec_field",
          label: "Seccion",
          type: "section",
          required: false,
          subFields: [
            { name: "sec_text", label: "Sec Text", type: "text", required: false },
          ]
        }
      ],
    },
    {
      id: "ACTA_VISITA_MANTENIMIENTO",
      name: "Mantenimiento Acta",
      fields: [
        { name: "extintores_total", label: "Total", type: "number" },
        { name: "ext_a_1", label: "A1", type: "number" },
        { name: "ext_otros", label: "Otros", type: "text" },
      ]
    }
  ],
}));


describe("FormatSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { key: "u1", firstName: "Test" };
  });

  const getSendButton = () => screen.getByRole("button", { name: /Enviar/i });

  it("renderiza lista de formatos", () => {
    render(<FormatSelector />);
    expect(screen.getByText("Formato de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento Acta")).toBeInTheDocument();
  });

  it("abre el formulario al clickear un formato", () => {
    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));
    expect(screen.getByText("Texto")).toBeInTheDocument();
    expect(screen.getByText("Numero")).toBeInTheDocument();
  });

  it("permite regresar a la lista de formatos", () => {
    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));
    // Cancelar modal
    const cancelBtn = screen.getByText("Cancelar");
    fireEvent.click(cancelBtn);
    expect(screen.queryByText("Texto")).not.toBeInTheDocument();
  });

  it("permite copiar enlace", async () => {
    render(<FormatSelector />);
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    const linkBtns = screen.getAllByTestId("LinkIcon");
    fireEvent.click(linkBtns[0].parentElement!);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith({
        open: true,
        message: "Enlace copiado al portapapeles",
        severity: "success",
      });
    });
  });

  it("guardar (mock final)", async () => {
    const { FormatService } = require("../../../services/format.service");
    FormatService.createSubmission.mockResolvedValueOnce({ result: "OK" });

    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));

    fireEvent.click(getSendButton());

    await waitFor(() => {
      expect(FormatService.createSubmission).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" })
      );
    });
  });

  it("falla envio y muestra error", async () => {
    const { FormatService } = require("../../../services/format.service");
    FormatService.createSubmission.mockResolvedValueOnce({ result: "ERROR", errorMessage: "Bad submission" });

    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));

    fireEvent.click(getSendButton());

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", message: "Bad submission" })
      );
    });
  });

  it("valida extintores defectuosos en el formato de mantenimiento", async () => {
    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Mantenimiento Acta"));

    const inputs = screen.getAllByRole("spinbutton"); // number inputs
    fireEvent.change(inputs[0], { target: { value: "10" } }); // total 10
    fireEvent.change(inputs[1], { target: { value: "5" } }); // ext_a_1 5

    fireEvent.click(getSendButton());

    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining("no coincide con el total declarado"),
      })
    );
  });
  
  it("interactua con grupos dinamicos", async () => {
    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));

    const addBtn = screen.getByText("+ Añadir ítem");
    fireEvent.click(addBtn);

    const deleteBtns = screen.getAllByTestId("DeleteOutlineIcon");
    if (deleteBtns.length > 0) {
      fireEvent.click(deleteBtns[0].parentElement!); 
    }

    expect(screen.getAllByText(/Ítem/i).length).toBeGreaterThan(0);
  });

  it("interactua con switch", async () => {
    const { FormatService } = require("../../../services/format.service");
    FormatService.createSubmission.mockResolvedValueOnce({ result: "OK" });
    
    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));

    const optionBtn = screen.getByText("SI", { selector: 'button' });
    fireEvent.click(optionBtn);
    
    fireEvent.click(getSendButton());

    await waitFor(() => {
      const callArgs = (FormatService.createSubmission as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.switch_field).toBe("SI");
    });
  });

  it("interactua con un checkbox de checkbox-group", async () => {
    const { FormatService } = require("../../../services/format.service");
    FormatService.createSubmission.mockResolvedValueOnce({ result: "OK" });

    render(<FormatSelector />);
    fireEvent.click(screen.getByText("Formato de Prueba"));

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]); // Op1
    fireEvent.click(checkboxes[0]); // untoggle Op1
    fireEvent.click(checkboxes[1]); // toggle Op2

    fireEvent.click(getSendButton());

    await waitFor(() => {
      const callArgs = (FormatService.createSubmission as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.checkbox_field).toEqual(["Op2"]);
    });
  });
});
