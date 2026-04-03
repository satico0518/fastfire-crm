import { FormatService } from "../format.service";
import { getDatabase, ref, push, set, update, get, query, orderByChild, equalTo } from "firebase/database";

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn((_db, path) => ({ path })),
  push: jest.fn(() => ({ key: 'new-key', path: 'new-path' })),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve()),
  query: jest.fn((r) => r),
  orderByChild: jest.fn(() => ({})),
  equalTo: jest.fn(() => ({})),
}));

// Mock crypto.randomUUID
if (typeof crypto !== 'undefined') {
  jest.spyOn(crypto, 'randomUUID').mockReturnValue("test-uuid" as any);
} else {
  (global as any).crypto = {
    randomUUID: () => "test-uuid",
  };
}

const mockSnapshot = (data: any, existsValue = true) => ({
  val: () => data,
  exists: () => existsValue,
  forEach: (callback: any) => {
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, val]) => callback({ key, val: () => val }));
    }
  },
  key: data?.key || 'mock-key'
});

describe("FormatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDatabase as jest.Mock).mockReturnValue({});
    (ref as jest.Mock).mockReturnValue({ path: 'test-path' });
    (push as jest.Mock).mockReturnValue({ key: 'new-key', path: 'new-path' });
    (set as jest.Mock).mockResolvedValue(undefined);
    (update as jest.Mock).mockResolvedValue(undefined);
    (get as jest.Mock).mockResolvedValue(mockSnapshot(null, false));
    (query as jest.Mock).mockImplementation((r) => r);
    (orderByChild as jest.Mock).mockReturnValue({});
    (equalTo as jest.Mock).mockReturnValue({});
  });

  describe("createSubmission", () => {
    it("debe crear un envío de formato exitosamente", async () => {
      const submission: any = { data: {} };
      const response = await FormatService.createSubmission(submission);

      expect(response.result).toBe("OK");
      expect(response.key).toBe("new-key");
      expect(set).toHaveBeenCalled();
    });

    it("debe manejar errores al crear envío", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (set as jest.Mock).mockRejectedValue(new Error("Fail"));
      
      const response = await FormatService.createSubmission({} as any);
      expect(response.result).toBe("ERROR");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("updateSubmission", () => {
    it("debe actualizar un envío existente", async () => {
      const submission: any = { key: "k1", data: { updated: true } };
      const response = await FormatService.updateSubmission(submission);
      expect(response.result).toBe("OK");
    });

    it("debe fallar si falta el key", async () => {
      const response = await FormatService.updateSubmission({} as any);
      expect(response.result).toBe("ERROR");
    });

    it("debe manejar errores en la actualización", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (update as jest.Mock).mockRejectedValue(new Error("Fail"));
      const response = await FormatService.updateSubmission({ key: 'k1' } as any);
      expect(response.result).toBe("ERROR");
      consoleSpy.mockRestore();
    });
  });

  describe("reviewSubmission", () => {
    it("debe aprobar un envío", async () => {
      const response = await FormatService.reviewSubmission("k1", "REVIEWED", "u1", "Aprobado");
      expect(response.result).toBe("OK");
      expect(response.message).toBe("Formato aprobado!");
    });

    it("debe rechazar un envío", async () => {
      const response = await FormatService.reviewSubmission("k1", "REJECTED", "u1", "Rechazado");
      expect(response.result).toBe("OK");
      expect(response.message).toBe("Formato rechazado.");
    });

    it("debe manejar errores al revisar", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (update as jest.Mock).mockRejectedValue(new Error("Fail"));
      const response = await FormatService.reviewSubmission("k1", "REVIEWED", "u1");
      expect(response.result).toBe("ERROR");
      consoleSpy.mockRestore();
    });
  });

  describe("getPublicSubmissionsByFormat", () => {
    it("debe obtener envíos públicos ordenados", async () => {
      const data = {
        'k1': { isPublicSubmission: true, createdDate: 1000 },
        'k2': { isPublicSubmission: false, createdDate: 2000 },
        'k3': { isPublicSubmission: true, createdDate: 3000 },
      };
      (get as jest.Mock).mockResolvedValue(mockSnapshot(data));

      const response = await FormatService.getPublicSubmissionsByFormat("type1");
      expect(response.result).toBe("OK");
      expect(response.data).toHaveLength(2);
      expect(response.data![0].createdDate).toBe(3000);
    });

    it("debe manejar snapshot inexistente", async () => {
      (get as jest.Mock).mockResolvedValue(mockSnapshot(null, false));
      const response = await FormatService.getPublicSubmissionsByFormat("type1");
      expect(response.result).toBe("OK");
      expect(response.data).toEqual([]);
    });

    it("debe manejar errores al obtener envíos", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (get as jest.Mock).mockRejectedValue(new Error("Fail"));
      const response = await FormatService.getPublicSubmissionsByFormat("type1");
      expect(response.result).toBe("ERROR");
      consoleSpy.mockRestore();
    });
  });

  describe("getSubmissionByPublicToken", () => {
    it("debe obtener envío por token válido", async () => {
      const tokenData = { 't1': { submissionId: "sub1", expiresAt: Date.now() + 10000 } };
      const submissionData = { data: "test", key: "sub1" };

      (get as jest.Mock)
        .mockResolvedValueOnce(mockSnapshot(tokenData))
        .mockResolvedValueOnce(mockSnapshot(submissionData));

      const response = await FormatService.getSubmissionByPublicToken("token1");
      expect(response.result).toBe("OK");
      expect(response.data?.data).toBe("test");
    });

    it("debe fallar si el token no existe", async () => {
      (get as jest.Mock).mockResolvedValue(mockSnapshot(null, false));
      const response = await FormatService.getSubmissionByPublicToken("none");
      expect(response.result).toBe("ERROR");
      expect(response.errorMessage).toBe("Token no encontrado o expirado.");
    });

    it("debe fallar si el token expiró", async () => {
      const tokenData = { 't1': { submissionId: "sub1", expiresAt: Date.now() - 1000 } };
      (get as jest.Mock).mockResolvedValue(mockSnapshot(tokenData));
      const response = await FormatService.getSubmissionByPublicToken("token1");
      expect(response.result).toBe("ERROR");
      expect(response.errorMessage).toBe("Token expirado.");
    });

    it("debe fallar si el envío no existe", async () => {
      const tokenData = { 't1': { submissionId: "sub1", expiresAt: Date.now() + 10000 } };
      (get as jest.Mock)
        .mockResolvedValueOnce(mockSnapshot(tokenData))
        .mockResolvedValueOnce(mockSnapshot(null, false));

      const response = await FormatService.getSubmissionByPublicToken("token1");
      expect(response.result).toBe("ERROR");
      expect(response.errorMessage).toBe("Envío no encontrado.");
    });

    it("debe manejar errores inesperados", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (get as jest.Mock).mockRejectedValue(new Error("Fail"));
      const response = await FormatService.getSubmissionByPublicToken("token1");
      expect(response.result).toBe("ERROR");
      consoleSpy.mockRestore();
    });
  });

  describe("logPublicAccess", () => {
    it("debe registrar acceso público sin fallar", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      await FormatService.logPublicAccess("token1", "VIEW_SUBMISSION");
      expect(push).toHaveBeenCalled();
      
      // Test error path (should just log error)
      (push as jest.Mock).mockRejectedValue(new Error("Fail"));
      await FormatService.logPublicAccess("token1", "DOWNLOAD_PDF");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

