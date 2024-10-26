import { create } from "zustand";
import { CityAutocomplete } from "../../services/cities.service";

interface CitiesState {
  cities: CityAutocomplete[];
  setCities: (cities: CityAutocomplete[]) => void;
}

export const useCitiesStore = create<CitiesState>()((set) => ({
    cities: [],
    setCities: (cities: CityAutocomplete[]) => set(() => ({ cities }))
}));
