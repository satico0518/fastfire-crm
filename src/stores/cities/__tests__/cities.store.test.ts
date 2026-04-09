import { useCitiesStore } from '../cities.store';
import { CityAutocomplete } from '../../../services/cities.service';
import { CitiesService } from '../../../services/cities.service';

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
    useCitiesStore.setState({ cities: [] });
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

  test('debe manejar error cuando falla loadCities', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (CitiesService.getCities as jest.Mock).mockRejectedValueOnce(new Error('Cities error'));

    await useCitiesStore.getState().loadCities();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caragndo cities desde store',
      expect.objectContaining({ error: expect.any(Error) })
    );
    consoleSpy.mockRestore();
  });
});
