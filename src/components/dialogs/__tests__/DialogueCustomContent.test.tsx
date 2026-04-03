import { render, screen, fireEvent } from "@testing-library/react";
import { DialogueCustomContent } from "../DialogueCustomContent";

describe("DialogueCustomContent", () => {
  const mockSetOpen = jest.fn();
  const mockOkAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe renderizar el título y el contenido cuando está abierto", () => {
    render(
      <DialogueCustomContent
        title="Título del Diálogo"
        open={true}
        setOpen={mockSetOpen}
        content={<div data-testid="custom-content">Contenido Personalizado</div>}
      />
    );

    expect(screen.getByText("Título del Diálogo")).toBeInTheDocument();
    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
  });

  it("debe llamar a setOpen(false) al hacer clic en Cancelar", () => {
    render(
      <DialogueCustomContent
        title="Título"
        open={true}
        setOpen={mockSetOpen}
        content={<div />}
      />
    );

    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it("debe llamar a okAction y setOpen(false) al hacer clic en el botón OK", () => {
    render(
      <DialogueCustomContent
        title="Título"
        open={true}
        setOpen={mockSetOpen}
        content={<div />}
        okText="Confirmar"
        okAction={mockOkAction}
      />
    );

    fireEvent.click(screen.getByText("Confirmar"));
    expect(mockOkAction).toHaveBeenCalledTimes(1);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
