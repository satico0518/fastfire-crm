import { CitiesService } from "../cities.service";
import { get, ref } from "firebase/database";

// Mock de firebase/database
jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

describe("CitiesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCities", () => {
    it("debe retornar una lista de ciudades cuando existen datos", async () => {
      const mockCities = {
        city1: "Bogotá",
        city2: "Medellín",
      };

      const mockSnapshot = {
        exists: () => true,
        val: () => mockCities,
      };

      (get as jest.Mock).mockResolvedValue(mockSnapshot);
      (ref as jest.Mock).mockReturnValue({});

      const result = await CitiesService.getCities();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ key: "city1", label: "Bogotá" });
      expect(result[1]).toEqual({ key: "city2", label: "Medellín" });
    });

    it("debe retornar un array vacío cuando no hay datos", async () => {
      const mockSnapshot = {
        exists: () => false,
      };

      (get as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await CitiesService.getCities();

      expect(result).toEqual([]);
    });

    it("debe retornar un array vacío y loguear error cuando ocurre una excepción", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Firebase error");

      (get as jest.Mock).mockRejectedValue(mockError);

      const result = await CitiesService.getCities();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("Error intentando obtener ciudades", { error: mockError });
      
      consoleSpy.mockRestore();
    });
  });
});
