import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TagsInput } from "../TagsInput";
import { TaskService } from "../../../services/task.service";
import { TagsService } from "../../../services/tags.service";
import userEvent from "@testing-library/user-event";

jest.mock("../../../services/task.service", () => ({
  TaskService: {
    updateTask: jest.fn(),
  },
}));

jest.mock("../../../services/tags.service", () => ({
  TagsService: {
    createTag: jest.fn(),
  },
}));

let mockTags = ["tag1", "tag2"];
jest.mock("../../../stores/tags/tags.store", () => ({
  useTagsStore: jest.fn((selector) =>
    selector({
      tags: mockTags,
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

jest.mock("../../dialogs/DialogueCustomContent", () => ({
  DialogueCustomContent: ({ title, open, content, okText, okAction }: any) => {
    if (!open) return null;
    return (
      <div data-testid="mock-dialog">
        <h2>{title}</h2>
        {content}
        <button onClick={okAction}>{okText}</button>
      </div>
    );
  },
}));

describe("TagsInput", () => {
  const mockTask: any = { id: 1, name: "Test", tags: ["tag1"] };
  const mockSetSelectedTags = jest.fn();
  const mockSetOpenTagsDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (selectedTags = ["tag1"]) => {
    return render(
      <TagsInput
        selectedTask={mockTask}
        setSelectedTags={mockSetSelectedTags}
        openTagsDialog={true}
        setOpenTagsDialog={mockSetOpenTagsDialog}
        selectedTags={selectedTags}
      />
    );
  };

  it("renderiza contenido y chips existentes", () => {
    renderComponent();
    expect(screen.getByText("tag1")).toBeInTheDocument();
  });

  it("elimina tag local y en db simulado", () => {
    renderComponent();
    // Encuentra el botón de eliminar del chip
    const deleteBtn = screen.getByTestId("CancelIcon"); // Default delete icon on chip
    fireEvent.click(deleteBtn);
    expect(TaskService.updateTask).toHaveBeenCalled();
  });

  it("maneja error en eliminar tag de tarea", async () => {
    (TaskService.updateTask as jest.Mock).mockRejectedValueOnce(new Error("Net error"));
    renderComponent();
    const deleteBtn = screen.getByTestId("CancelIcon");
    fireEvent.click(deleteBtn);
    
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });

  it("elimina etiqueta usando el boton remove de from DB", () => {
    renderComponent(["tag1", "tag2"]);
    const removeBtn = screen.getAllByTestId("RemoveCircleOutlinedIcon")[0];
    fireEvent.click(removeBtn.parentElement!); // the IconButton
    expect(mockSetSelectedTags).toHaveBeenCalled();
    expect(mockSetSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" })
    );
  });

  it("agrega un nuevo tag y llama createTag si no existe", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Type a new tag "new_tag" in autocomplete textfield
    const input = screen.getByRole("combobox");
    
    await user.type(input, "new_tag");
    
    // There is an Add button near it
    const addBtn = screen.getByTestId("AddCircleOutlinedIcon");
    fireEvent.click(addBtn.parentElement!);

    expect(TagsService.createTag).toHaveBeenCalledWith("new_tag");
    expect(mockSetSelectedTags).toHaveBeenCalled(); // Should update with new_tag
  });

  it("guarda tags editados usando okAction con exito", async () => {
    (TaskService.updateTask as jest.Mock).mockResolvedValueOnce({ result: "OK" });
    renderComponent();
    
    fireEvent.click(screen.getByText("Guardar"));
    
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" })
      );
    });
    expect(mockSetSelectedTags).toHaveBeenCalledWith([]);
  });

  it("guarda tags pero recibe error desde el server", async () => {
    (TaskService.updateTask as jest.Mock).mockResolvedValueOnce({ result: "ERROR", errorMessage: "Bad" });
    renderComponent();
    
    fireEvent.click(screen.getByText("Guardar"));
    
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", message: "Error editando tarea." })
      );
    });
  });
});
