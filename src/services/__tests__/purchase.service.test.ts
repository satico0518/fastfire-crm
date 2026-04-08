import { PurchaseService } from "../purchase.service";
import { get, push, remove, set, update } from "firebase/database";

jest.mock("firebase/database", () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
}));

describe("PurchaseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addItemToStock", () => {
    it("debe agregar un item al stock exitosamente", async () => {
      const mockPush = { key: "mock-key" };
      (push as jest.Mock).mockReturnValue(mockPush);
      (set as jest.Mock).mockResolvedValue(true);

      const item: any = { name: "Item 1" };
      const response = await PurchaseService.addItemToStock(item);

      expect(response.result).toBe("OK");
      expect(set).toHaveBeenCalledWith(mockPush, expect.objectContaining({ key: "mock-key", status: "ACTIVE" }));
    });
  });

  describe("addStockFromExcel", () => {
    it("debe procesar datos de Excel y guardarlos", async () => {
      (set as jest.Mock).mockResolvedValue(true);
      const data: any[] = [{ codigo: "C1", item: "Item 1", valor: 100, licitar: "s", cantidad: 10 }];

      const response = await PurchaseService.addStockFromExcel(data);

      expect(response.result).toBe("OK");
      expect(set).toHaveBeenCalledWith(expect.anything(), expect.arrayContaining([
        expect.objectContaining({ id: "C1", name: "ITEM 1" })
      ]));
    });
  });

  describe("modifyItem", () => {
    it("debe modificar un item exitosamente", async () => {
      (update as jest.Mock).mockResolvedValue(true);
      const item: any = { key: "k1", name: "Modified" };

      const response = await PurchaseService.modifyItem(item);

      expect(response.result).toBe("OK");
    });
  });

  describe("deleteItem", () => {
    it("debe eliminar un item exitosamente", async () => {
      (remove as jest.Mock).mockResolvedValue(true);
      const item: any = { key: "k1" };

      const response = await PurchaseService.deleteItem(item);

      expect(response.result).toBe("OK");
    });
  });

  describe("archiveItem", () => {
    it("debe archivar un item (soft delete) exitosamente", async () => {
      (update as jest.Mock).mockResolvedValue(true);
      const item: any = { key: "k1" };

      const response = await PurchaseService.archiveItem(item);

      expect(response.result).toBe("OK");
      expect(update).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: "INACTIVE" }));
    });
  });

  describe("saveProviderLicitation", () => {
    it("debe guardar la licitación del proveedor", async () => {
      (set as jest.Mock).mockResolvedValue(true);
      const licitation: any = { providerKey: "p1", data: {} };

      const response = await PurchaseService.saveProviderLicitation(licitation);

      expect(response.result).toBe("OK");
    });
  });

  describe("getProviderLicitation", () => {
    it("debe obtener la licitación del proveedor", async () => {
      const mockData = { providerKey: "p1" };
      (get as jest.Mock).mockResolvedValue({
        toJSON: () => mockData,
      });

      const result = await PurchaseService.getProviderLicitation("p1");

      expect(result).toEqual(mockData);
    });

    it("debe retornar null cuando ocurre un error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (get as jest.Mock).mockRejectedValue(new Error("Fail"));

      const result = await PurchaseService.getProviderLicitation("p1");

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
