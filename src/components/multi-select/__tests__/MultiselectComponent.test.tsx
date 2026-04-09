import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MultiselectComponent } from "../MultiselectComponent";

describe("MultiselectComponent", () => {
  const defaultProps = {
    title: "Seleccionar Opciones",
    labels: ["Opción 1", "Opción 2", "Opción 3"],
    value: [],
  };

  const mockSetValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza correctamente con placeholder cuando no hay selección", () => {
    render(<MultiselectComponent {...defaultProps} setValue={mockSetValue} />);
    expect(screen.getByText("Seleccionar Opciones")).toBeInTheDocument();
  });

  it("renderiza chips cuando hay opciones seleccionadas", () => {
    render(
      <MultiselectComponent
        {...defaultProps}
        value={["Opción 1", "Opción 2"]}
        setValue={mockSetValue}
      />
    );
    expect(screen.getByText("Opción 1")).toBeInTheDocument();
    expect(screen.getByText("Opción 2")).toBeInTheDocument();
  });

  it("permite borrar un chip", () => {
    render(
      <MultiselectComponent
        {...defaultProps}
        value={["Opción 1"]}
        setValue={mockSetValue}
      />
    );
    const deleteIcon = screen.getByTestId("CancelIcon"); // Default delete icon of MUI Chip
    fireEvent.click(deleteIcon);
    expect(mockSetValue).toHaveBeenCalledWith([]);
  });

  it("permite abrir el menú desplegable y seleccionar elementos", async () => {
    render(<MultiselectComponent {...defaultProps} setValue={mockSetValue} />);
    
    // MUI Select uses combobox role or button depending on setup, generic is to get the element by its button wrapper
    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    // Listbox should appear
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText("Opción 1"));

    expect(mockSetValue).toHaveBeenCalledWith(["Opción 1"]);
  });
});
