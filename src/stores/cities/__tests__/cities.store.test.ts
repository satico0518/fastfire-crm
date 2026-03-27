import { useCitiesStore } from '../cities.store';
import { CityAutocomplete } from '../../../services/cities.service';

// Mock de CitiesService
jest.mock('../../../services/cities.service', () => ({
  CitiesService: {
    getCities: jest.fn().mockResolvedValue([
      { key: 'BOG', label: 'Bogotá' },
      { key: 'MDE', label: 'Medellín' }
    ])
  },
  CityAutocomplete: jest.fn()
}));

describe('Cities Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useCitiesStore.getState();
    expect(state.cities).toBeDefined();
    expect(Array.isArray(state.cities)).toBe(true);
  });

  test('debe establecer cities correctamente', () => {
    const mockCities: CityAutocomplete[] = [
      { key: 'BOG', label: 'Bogotá' },
      { key: 'MDE', label: 'Medellín' }
    ];
    useCitiesStore.getState().setCities(mockCities);
    expect(useCitiesStore.getState().cities).toEqual(mockCities);
  });
});
