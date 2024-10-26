import { get, ref } from "firebase/database";
import { db } from "../firebase/firebase.config";

export interface CityAutocomplete {
  key: string;
  label: string;
}

export class CitiesService {
  static async getCities(): Promise<CityAutocomplete[]> {
    try {
      const citiesRef = ref(db, "cities");
      const snapshot = await get(citiesRef);

      if (snapshot.exists()) {
        return Object.entries(snapshot.val()).map(([key, value]) => ({
          key,
          label: value,
        })) as CityAutocomplete[];
      }

      return [];
    } catch (error) {
      console.error("Error intentando obtener ciudades", {error});
      return []
    }
  }
}
