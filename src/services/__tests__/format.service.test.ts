import { FormatService } from "../format.service";
import { push, set, update, get } from "firebase/database";

jest.mock("firebase/database", () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(),
  set: jest.fn(),
  onValue: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn(),
  get: jest.fn(),
}));

// Mock crypto.randomUUID
if (typeof crypto !== 'undefined') {
  jest.spyOn(crypto, 'randomUUID').mockReturnValue("test-uuid" as any);
} else {
  (global as any).crypto = {
    randomUUID: () => "test-uuid",
  };
}

describe("FormatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSubmission", () => {
    it("debe crear un envío de formato exitosamente", async () => {
      const mockPush = { key: "mock-key" };
      (push as jest.Mock).mockReturnValue(mockPush);
      (set as jest.Mock).mockResolvedValue(true);

      const submission: any = { data: {} };
      const response = await FormatService.createSubmission(submission);

      expect(response.result).toBe("OK");
      expect(response.key).toBe("mock-key");
      expect(set).toHaveBeenCalledWith(mockPush, expect.objectContaining({ key: "mock-key" }));
    });
  });

  describe("updateSubmission", () => {
    it("debe actualizar un envío existente", async () => {
      (update as jest.Mock).mockResolvedValue(true);
      const submission: any = { key: "k1", data: { updated: true } };

      const response = await FormatService.updateSubmission(submission);

      expect(response.result).toBe("OK");
    });

    it("debe fallar si falta el key", async () => {
      const response = await FormatService.updateSubmission({} as any);
      expect(response.result).toBe("ERROR");
    });
  });

  describe("reviewSubmission", () => {
    it("debe aprobar un envío", async () => {
      (update as jest.Mock).mockResolvedValue(true);
      const response = await FormatService.reviewSubmission("k1", "REVIEWED", "u1", "Aprobado");

      expect(response.result).toBe("OK");
      expect(response.message).toBe("Formato aprobado!");
      expect(update).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: "REVIEWED" }));
    });
  });

  describe("getPublicSubmissionsByFormat", () => {
    it("debe obtener envíos públicos por tipo de formato", async () => {
      const mockSubmissions = [
        { isPublicSubmission: true, createdDate: 1000 },
        { isPublicSubmission: false, createdDate: 2000 },
        { isPublicSubmission: true, createdDate: 3000 },
      ];
      
      const mockSnapshot = {
        exists: () => true,
        forEach: (callback: any) => {
          mockSubmissions.forEach((s, index) => callback({ key: `key${index}`, val: () => s }));
        }
      };

      (get as jest.Mock).mockResolvedValue(mockSnapshot);

      const response = await FormatService.getPublicSubmissionsByFormat("type1");

      expect(response.result).toBe("OK");
      expect(response.data).toHaveLength(2);
      // Sorted by date desc
      expect(response.data![0].createdDate).toBe(3000);
    });
  });

  describe("createPublicAccessToken", () => {
    it("debe crear un token de acceso público", async () => {
      (push as jest.Mock).mockResolvedValue({ key: "token-key" });
      const response = await FormatService.createPublicAccessToken("sub1");

      expect(response.result).toBe("OK");
      expect(response.token).toBe("test-uuid");
      expect(push).toHaveBeenCalled();
    });
  });

  describe("getSubmissionByPublicToken", () => {
    it("debe obtener un envío usando un token válido", async () => {
      const mockTokenData = { submissionId: "sub1", expiresAt: Date.now() + 10000 };
      const mockTokenSnapshot = {
        exists: () => true,
        forEach: (callback: any) => callback({ val: () => mockTokenData })
      };
      
      const mockSubmission = { data: "test" };
      const mockSubSnapshot = {
        exists: () => true,
        val: () => mockSubmission,
        key: "sub1"
      };

      (get as jest.Mock)
        .mockResolvedValueOnce(mockTokenSnapshot) // call for token
        .mockResolvedValueOnce(mockSubSnapshot); // call for submission

      const response = await FormatService.getSubmissionByPublicToken("token1");

      expect(response.result).toBe("OK");
      expect(response.data?.data).toBe("test");
    });

    it("debe fallar si el token expiró", async () => {
      const mockTokenData = { submissionId: "sub1", expiresAt: Date.now() - 10000 };
      const mockTokenSnapshot = {
        exists: () => true,
        forEach: (callback: any) => callback({ val: () => mockTokenData })
      };

      (get as jest.Mock).mockResolvedValue(mockTokenSnapshot);

      const response = await FormatService.getSubmissionByPublicToken("token1");

      expect(response.result).toBe("ERROR");
      expect(response.errorMessage).toBe("Token expirado.");
    });
  });
});
