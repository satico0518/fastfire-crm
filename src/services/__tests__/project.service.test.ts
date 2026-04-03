import { ProjectService } from "../project.service";
import { push, ref, set, update } from "firebase/database";

jest.mock("firebase/database", () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
}));

jest.mock("../../firebase/firebase.config", () => ({
  auth: {
    currentUser: { uid: "test-user-id" },
  },
  db: {},
}));

jest.mock("uuid", () => ({
  v4: () => "test-uuid",
}));

describe("ProjectService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("debe crear un proyecto exitosamente", async () => {
      const mockPush = { key: "mock-key" };
      (push as jest.Mock).mockReturnValue(mockPush);
      (ref as jest.Mock).mockReturnValue({ key: "projects" });
      (set as jest.Mock).mockResolvedValue(true);

      const project: any = { name: "Test Project" };
      const response = await ProjectService.createProject(project);

      expect(response.result).toBe("OK");
      expect(response.message).toBe("Proyecto creado exitosamente!");
      expect(set).toHaveBeenCalledWith(mockPush, expect.objectContaining({
        id: "test-uuid",
        key: "mock-key",
        createdByUserId: "test-user-id",
        status: "TODO",
      }));
    });

    it("debe retornar error cuando falla la creación", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (push as jest.Mock).mockReturnValue({ key: "mock-key" });
      (set as jest.Mock).mockRejectedValue(new Error("Firebase error"));

      const project: any = { name: "Test Project" };
      const response = await ProjectService.createProject(project);

      expect(response.result).toBe("ERROR");
      expect(response.errorMessage).toBe("Error tratando de crear Proyecto");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("deleteProject", () => {
    it("debe realizar un soft delete del proyecto exitosamente", async () => {
      (update as jest.Mock).mockResolvedValue(true);
      (ref as jest.Mock).mockReturnValue({});

      const response = await ProjectService.deleteProject("some-key");

      expect(response.result).toBe("OK");
      expect(update).toHaveBeenCalledWith(expect.anything(), { status: "DELETED" });
    });

    it("debe retornar error cuando falla la eliminación", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (update as jest.Mock).mockRejectedValue(new Error("Update fail"));

      const response = await ProjectService.deleteProject("some-key");

      expect(response.result).toBe("ERROR");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("updateProject", () => {
    it("debe actualizar un proyecto exitosamente", async () => {
      (update as jest.Mock).mockResolvedValue(true);
      (ref as jest.Mock).mockReturnValue({});

      const project: any = { key: "some-key", name: "Updated Name" };
      const response = await ProjectService.updateProject(project);

      expect(response.result).toBe("OK");
      expect(update).toHaveBeenCalledWith(expect.anything(), project);
    });

    it("debe retornar error cuando falla la actualización", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (update as jest.Mock).mockRejectedValue(new Error("Update fail"));

      const response = await ProjectService.updateProject({ key: "some-key" } as any);

      expect(response.result).toBe("ERROR");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
