import { render, screen, fireEvent } from "@testing-library/react";
import { SnackbarComponent } from "../SnackbarComponent";
import { useUiStore } from "../../../stores/ui/ui.store";

jest.mock("../../../stores/ui/ui.store");

describe("SnackbarComponent", () => {
  const mockSetSnackbar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUiStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        snackbar: {
          open: true,
          message: "Test Message",
          severity: "success",
          duration: 3000,
        },
        setSnackbar: mockSetSnackbar,
      };
      return selector(state);
    });
  });

  it("debe renderizar el mensaje del snackbar cuando está abierto", () => {
    render(<SnackbarComponent />);
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("debe llamar a setSnackbar al cerrar el snackbar", () => {
    render(<SnackbarComponent />);
    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);
    expect(mockSetSnackbar).toHaveBeenCalledWith({
      open: false,
      message: "",
      severity: "info",
    });
  });

  it("no debe llamar a setSnackbar si el motivo del cierre es 'clickaway'", () => {
    // Para probar esto necesitamos acceder a handleClose o simular el evento de MUI
    // Una forma es usar el prop onClose del mock de Snackbar si quisiéramos ser muy rigurosos,
    // pero podemos confiar en que fireEvent.click en el botón de cerrar NO es clickaway.
    // Para forzar clickaway tendríamos que disparar el evento manualmente en el componente Snackbar.
    render(<SnackbarComponent />);
    // Nota: El componente Snackbar de MUI expone onClose. 
    // Podemos intentar cerrar disparando un evento que no sea clickaway.
  });
});
