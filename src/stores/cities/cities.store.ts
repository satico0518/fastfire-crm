import { create } from "zustand";
import { CitiesService, CityAutocomplete } from "../../services/cities.service";
import { devtools } from "zustand/middleware";

interface CitiesState {
  cities: CityAutocomplete[];
  loadCities: () => void;
  setCities: (cities: CityAutocomplete[]) => void;
}

export const useCitiesStore = create<CitiesState>()(
  devtools((set) => ({
    cities: [],
    loadCities: async () => {
      try {
        const citiesResponse = await CitiesService.getCities();
        set({cities: citiesResponse})
      } catch (error) {
        console.error('Error caragndo cities desde store', {error});
      }
    },
    setCities: (cities: CityAutocomplete[]) => set(() => ({ cities })),
  }))
);

useCitiesStore.getState().loadCities()