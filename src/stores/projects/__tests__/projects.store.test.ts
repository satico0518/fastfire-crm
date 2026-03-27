import { useProjectsStore } from '../projects.store';
import { Project } from '../../../interfaces/Project';

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'project-1': {
          id: 'proj1',
          key: 'proj1',
          name: 'Proyecto Test',
          createdDate: Date.now(),
          createdByUserId: 'user1',
          status: 'TODO',
          location: 'Bogotá'
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
        id: 'proj1',
        key: 'proj1',
        name: 'Proyecto Test',
        createdDate: Date.now(),
        createdByUserId: 'user1',
        status: 'TODO',
        location: 'Bogotá',
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
