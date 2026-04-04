import { render, fireEvent, waitFor } from "@testing-library/react";
import CloudinaryUploadWidget from "../CloudinaryWidget";

// Mock de dependencias externas
jest.mock("@/services/users.service", () => ({
  UsersService: {
    modifyUser: jest.fn().mockResolvedValue({ result: "OK" })
  }
}));

jest.mock("@/stores", () => ({
  useAuhtStore: jest.fn().mockImplementation(() => ({ user: { avatarURL: "", name: "Test" } })),
}));

jest.mock("@/stores/ui/ui.store", () => ({
  useUiStore: jest.fn().mockImplementation(() => ({ setSnackbar: jest.fn() })),
}));

describe("CloudinaryUploadWidget", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renderiza el botón de carga", () => {
    const { getByRole } = render(
      <CloudinaryUploadWidget uwConfig={{}} />
    );
    expect(getByRole("button")).toBeInTheDocument();
  });

  it("agrega el script de Cloudinary si no existe", async () => {
    render(<CloudinaryUploadWidget uwConfig={{}} />);
    await waitFor(() => {
      expect(document.getElementById("uw")).toBeTruthy();
    });
  });

  it("no agrega el script si ya existe", async () => {
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);
    render(<CloudinaryUploadWidget uwConfig={{}} />);
    await waitFor(() => {
      expect(document.querySelectorAll("#uw").length).toBe(1);
    });
  });

  it("llama a window.cloudinary.createUploadWidget si está cargado y hay usuario", async () => {
    const openMock = jest.fn();
    window.cloudinary = {
      createUploadWidget: jest.fn().mockReturnValue({ open: openMock })
    };
    // Simular que el script ya está cargado
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);
    const { getByRole } = render(<CloudinaryUploadWidget uwConfig={{}} />);
    // Forzar el estado loaded a true
    await waitFor(() => {
      expect(document.getElementById("uw")).toBeTruthy();
    });
    // Simular click
    fireEvent.click(getByRole("button"));
    expect(window.cloudinary.createUploadWidget).toHaveBeenCalled();
  });
});
