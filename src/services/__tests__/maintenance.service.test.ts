import { MaintenanceService } from "../maintenance.service";
import { push, set, onValue, update, remove, get, ref } from "firebase/database";

jest.mock("firebase/database", () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(),
  set: jest.fn(),
  onValue: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
}));

describe("MaintenanceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSchedule", () => {
    it("debe crear un agendamiento exitosamente", async () => {
      const mockPush = { key: "mock-id" };
      (push as jest.Mock).mockReturnValue(mockPush);
      (ref as jest.Mock).mockReturnValue({});
      (set as jest.Mock).mockResolvedValue(true);

      const schedule: any = { projectName: "Test", dateStr: "2023-01-01" };
      const response = await MaintenanceService.createSchedule(schedule);

      expect(response.result).toBe("OK");
      expect(response.id).toBe("mock-id");
      expect(set).toHaveBeenCalledWith(mockPush, expect.objectContaining({ id: "mock-id" }));
    });

    it("debe retornar error cuando falla la creación", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (push as jest.Mock).mockReturnValue({ key: "mock-id" });
      (set as jest.Mock).mockRejectedValue(new Error("Firebase fail"));

      const response = await MaintenanceService.createSchedule({} as any);

      expect(response.result).toBe("ERROR");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("subscribeToSchedules", () => {
    it("debe llamar al callback con una lista de agendamientos", () => {
      const mockData = {
        id1: { projectName: "P1" },
        id2: { projectName: "P2" },
      };
      const mockSnapshot = {
        val: () => mockData,
      };

      (onValue as jest.Mock).mockImplementation((_ref, callback) => {
        callback(mockSnapshot);
        return jest.fn(); // Unsubscribe function
      });

      const callback = jest.fn();
      MaintenanceService.subscribeToSchedules(callback);

      expect(callback).toHaveBeenCalledWith([
        { id: "id1", projectName: "P1" },
        { id: "id2", projectName: "P2" },
      ]);
    });

    it("debe llamar al callback con array vacío si no hay datos", () => {
      (onValue as jest.Mock).mockImplementation((_ref, callback) => {
        callback({ val: () => null });
        return jest.fn();
      });

      const callback = jest.fn();
      MaintenanceService.subscribeToSchedules(callback);

      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe("updateSchedule", () => {
    it("debe actualizar el agendamiento y registrar auditoría", async () => {
      const currentSchedule = { id: "id1", projectName: "OldName", editHistory: [] };
      (get as jest.Mock).mockResolvedValue({
        val: () => currentSchedule,
      });
      (update as jest.Mock).mockResolvedValue(true);
      (ref as jest.Mock).mockReturnValue({});

      const updates = { projectName: "NewName" };
      const response = await MaintenanceService.updateSchedule("id1", updates, "User1");

      expect(response.result).toBe("OK");
      expect(update).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        projectName: "NewName",
        updatedBy: "User1",
      }));
    });

    it("debe retornar error si el agendamiento no existe", async () => {
      (get as jest.Mock).mockResolvedValue({ val: () => null });

      const response = await MaintenanceService.updateSchedule("id1", {}, "User1");

      expect(response.result).toBe("ERROR");
      expect(response.errorMessage).toBe("El agendamiento no existe.");
    });
  });

  describe("deleteSchedule", () => {
    it("debe eliminar el agendamiento exitosamente", async () => {
      (remove as jest.Mock).mockResolvedValue(true);
      (ref as jest.Mock).mockReturnValue({});

      const response = await MaintenanceService.deleteSchedule("id1");

      expect(response.result).toBe("OK");
      expect(remove).toHaveBeenCalled();
    });

    it("debe retornar error cuando falla la eliminación", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (remove as jest.Mock).mockRejectedValue(new Error("Fail"));

      const response = await MaintenanceService.deleteSchedule("id1");

      expect(response.result).toBe("ERROR");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
