import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationComponent } from "../ConfirmationComponent";
import { useUiStore } from "../../../stores/ui/ui.store";

jest.mock("../../../stores/ui/ui.store");

describe("ConfirmationComponent", () => {
  const mockSetConfirmation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe renderizar el título, texto y acciones de confirmación", () => {
    (useUiStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        confirmation: {
          open: true,
          title: "Confirmar Eliminar",
          text: "¿Está seguro de eliminar este elemento?",
          actions: <button data-testid="confirm-btn">Eliminar</button>,
        },
        setConfirmation: mockSetConfirmation,
      };
      return selector(state);
    });

    render(<ConfirmationComponent />);
    
    expect(screen.getByText("Confirmar Eliminar")).toBeInTheDocument();
    expect(screen.getByText("¿Está seguro de eliminar este elemento?")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-btn")).toBeInTheDocument();
  });

  it("debe llamar a setConfirmation con open: false al hacer clic en Cancelar", () => {
    (useUiStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          confirmation: {
            open: true,
            title: "Confirmar",
          },
          setConfirmation: mockSetConfirmation,
        };
        return selector(state);
      });

    render(<ConfirmationComponent />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockSetConfirmation).toHaveBeenCalledWith(expect.objectContaining({ open: false }));
  });
});
