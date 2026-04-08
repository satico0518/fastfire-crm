import { render, screen, fireEvent } from "@testing-library/react";
import { DialogueMultiselect } from "../DialogueMultiselect";

jest.mock("../../multi-select/MultiselectComponent", () => ({
  MultiselectComponent: () => <div data-testid="mock-multiselect" />,
}));

describe("DialogueMultiselect", () => {
  const mockSetOpen = jest.fn();
  const mockSetValue = jest.fn();
  const mockOkButtonAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe renderizar el título y el componente multiselect cuando está abierto", () => {
    render(
      <DialogueMultiselect
        title="Selecciona Opciones"
        open={true}
        setOpen={mockSetOpen}
        labels={["A", "B"]}
        value={[]}
        setValue={mockSetValue}
      />
    );

    expect(screen.getByText("Selecciona Opciones")).toBeInTheDocument();
    expect(screen.getByTestId("mock-multiselect")).toBeInTheDocument();
  });

  it("debe limpiar el valor y llamar a setOpen(false) al hacer clic en Cancelar", () => {
    render(
      <DialogueMultiselect
        title="Título"
        open={true}
        setOpen={mockSetOpen}
        labels={[]}
        value={["A"]}
        setValue={mockSetValue}
      />
    );

    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockSetValue).toHaveBeenCalledWith([]);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it("debe llamar a okButtonAction y setOpen(false) al hacer clic en el botón OK", () => {
    render(
      <DialogueMultiselect
        title="Título"
        open={true}
        setOpen={mockSetOpen}
        labels={[]}
        value={["A"]}
        setValue={mockSetValue}
        okButtonText="Continuar"
        okButtonAction={mockOkButtonAction}
      />
    );

    fireEvent.click(screen.getByText("Continuar"));
    expect(mockOkButtonAction).toHaveBeenCalledTimes(1);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
