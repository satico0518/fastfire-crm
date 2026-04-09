import { render, fireEvent, waitFor, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CloudinaryUploadWidget from "../CloudinaryWidget";
import { UsersService } from "../../../services/users.service";
import { useAuthStore } from "../../../stores";
import { useUiStore } from "../../../stores/ui/ui.store";

jest.mock("../../../services/users.service", () => ({
  UsersService: {
    modifyUser: jest.fn(),
  },
}));

jest.mock("../../../stores", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn(),
}));

describe("CloudinaryUploadWidget", () => {
  const setSnackbarMock = jest.fn();
  const user = { key: "u1", avatarURL: "", name: "Test" };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: { user: typeof user | null }) => unknown) =>
        selector({ user })
    );

    (useUiStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: { setSnackbar: typeof setSnackbarMock }) => unknown) =>
        selector({ setSnackbar: setSnackbarMock })
    );

    (UsersService.modifyUser as jest.Mock).mockResolvedValue({ result: "OK" });
  });

  it("renderiza el botón de carga", () => {
    render(<CloudinaryUploadWidget uwConfig={{}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("agrega el script de Cloudinary si no existe", async () => {
    render(<CloudinaryUploadWidget uwConfig={{}} />);
    await waitFor(() => {
      expect(document.getElementById("uw")).toBeTruthy();
    });
  });

  it("activa loaded cuando el script emite evento load", async () => {
    (window as any).cloudinary = {
      createUploadWidget: jest.fn().mockReturnValue({ open: jest.fn() }),
    };

    render(<CloudinaryUploadWidget uwConfig={{}} />);
    const script = document.getElementById("uw") as HTMLScriptElement;
    act(() => {
      script.dispatchEvent(new Event("load"));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button"));
      expect((window as any).cloudinary.createUploadWidget).toHaveBeenCalled();
    });
  });

  it("marca como loaded cuando el script ya existe", async () => {
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);

    render(<CloudinaryUploadWidget uwConfig={{}} />);
    await waitFor(() => {
      expect(document.querySelectorAll("#uw").length).toBe(1);
    });
  });

  it("inicializa widget, abre uploader y procesa subida exitosa", async () => {
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);

    const openMock = jest.fn();
    let uploadCallback: ((error: unknown, result: { event: string; info: { url: string } }) => Promise<void> | void) | undefined;

    (window as any).cloudinary = {
      createUploadWidget: jest.fn((_cfg: unknown, cb: typeof uploadCallback) => {
        uploadCallback = cb;
        return { open: openMock };
      }),
    };

    render(<CloudinaryUploadWidget uwConfig={{ cloudName: "fastfire" }} />);

    const button = screen.getByRole("button");
    fireEvent.click(button); // registra listener y crea widget
    fireEvent.click(button); // dispara listener -> open

    expect((window as any).cloudinary.createUploadWidget).toHaveBeenCalled();
    expect(openMock).toHaveBeenCalled();

    await uploadCallback?.(null, {
      event: "success",
      info: { url: "https://cdn.test/avatar.jpg" },
    });

    expect(user.avatarURL).toBe("https://cdn.test/avatar.jpg");
    expect(UsersService.modifyUser).toHaveBeenCalledWith(user);
    expect(setSnackbarMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", message: "Foto cargada exitosamente!" })
    );
  });

  it("muestra snackbar de error cuando modifyUser falla", async () => {
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);

    (UsersService.modifyUser as jest.Mock).mockResolvedValueOnce({ result: "ERROR" });

    let uploadCallback: ((error: unknown, result: { event: string; info: { url: string } }) => Promise<void> | void) | undefined;
    (window as any).cloudinary = {
      createUploadWidget: jest.fn((_cfg: unknown, cb: typeof uploadCallback) => {
        uploadCallback = cb;
        return { open: jest.fn() };
      }),
    };

    render(<CloudinaryUploadWidget uwConfig={{}} />);
    fireEvent.click(screen.getByRole("button"));

    await uploadCallback?.(null, {
      event: "success",
      info: { url: "https://cdn.test/avatar2.jpg" },
    });

    expect(setSnackbarMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", message: "Error cargando foto!" })
    );
  });

  it("registra error de widget cuando callback recibe error", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);

    let uploadCallback: ((error: unknown, result: { event: string; info: { url: string } }) => Promise<void> | void) | undefined;
    (window as any).cloudinary = {
      createUploadWidget: jest.fn((_cfg: unknown, cb: typeof uploadCallback) => {
        uploadCallback = cb;
        return { open: jest.fn() };
      }),
    };

    render(<CloudinaryUploadWidget uwConfig={{}} />);
    fireEvent.click(screen.getByRole("button"));

    await uploadCallback?.({ message: "widget error" }, {
      event: "success",
      info: { url: "https://cdn.test/error.jpg" },
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("no crea widget si no hay usuario autenticado", () => {
    const script = document.createElement("script");
    script.id = "uw";
    document.body.appendChild(script);

    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: { user: null }) => unknown) => selector({ user: null })
    );

    (window as any).cloudinary = {
      createUploadWidget: jest.fn(),
    };

    render(<CloudinaryUploadWidget uwConfig={{}} />);
    fireEvent.click(screen.getByRole("button"));

    expect((window as any).cloudinary.createUploadWidget).not.toHaveBeenCalled();
  });
});
