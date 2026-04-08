import { render, screen, fireEvent } from "@testing-library/react";
import ModalComponent from "../ModalComponent";
import { useUiStore } from "../../../stores/ui/ui.store";

jest.mock("../../../stores/ui/ui.store");

describe("ModalComponent", () => {
  const mockSetModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe renderizar el título y contenido del modal", () => {
    (useUiStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        modal: {
          open: true,
          title: "Modal de Prueba",
          text: "Mensaje de prueba",
          content: <div data-testid="modal-content">Contenido</div>,
          actions: <button data-testid="modal-action">Aceptar</button>,
        },
        setModal: mockSetModal,
      };
      return selector(state);
    });

    render(<ModalComponent />);
    
    expect(screen.getByText("Modal de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Mensaje de prueba")).toBeInTheDocument();
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    expect(screen.getByTestId("modal-action")).toBeInTheDocument();
  });

  it("debe llamar a setModal con open: false al hacer clic en Cancelar", () => {
    (useUiStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          modal: {
            open: true,
            title: "Modal",
            content: null,
          },
          setModal: mockSetModal,
        };
        return selector(state);
      });

    render(<ModalComponent />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockSetModal).toHaveBeenCalledWith(expect.objectContaining({ open: false }));
  });
});
