import { useProjectsStore } from '../projects.store';
import { Project } from '../../../interfaces/Project';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'project-1': {
          key: 'proj1',
          name: 'Proyecto Test',
          isActive: true,
          companyKey: 'comp1',
          color: '#4CAF50'
        }
      })
    });
    return jest.fn();
  })
}));

describe('Projects Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener estado inicial correcto', () => {
    const state = useProjectsStore.getState();
    expect(state.projects).toBeDefined();
    expect(Array.isArray(state.projects)).toBe(true);
  });

  test('debe establecer projects correctamente', () => {
    const mockProjects: Project[] = [
      {
        key: 'proj1',
        name: 'Proyecto Test',
        isActive: true,
        companyKey: 'comp1',
        color: '#4CAF50'
      }
    ];
    useProjectsStore.getState().setProjects(mockProjects);
    expect(useProjectsStore.getState().projects).toEqual(mockProjects);
  });

  test('debe establecer hasHydrated correctamente', () => {
    useProjectsStore.getState().setHasHydrated(true);
    expect(useProjectsStore.getState().hasHydrated).toBe(true);
  });
});
