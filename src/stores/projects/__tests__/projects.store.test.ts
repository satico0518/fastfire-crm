import { useProjectsStore } from '../projects.store';
import { Project } from '../../../interfaces/Project';
import { onValue, ref } from 'firebase/database';

jest.mock('firebase/database', () => ({
  __esModule: true,
  ref: jest.fn(),
  onValue: jest.fn((_ref, callback) => {
    callback({
      val: () => ({
        'p1': { key: 'p1', name: 'Proj 1', status: 'IN_PROGRESS' },
        'p2': { key: 'p2', name: 'Proj 2', status: 'DONE' },
      }),
    });
    return jest.fn(); // Unsubscribe
  }),
}));

const mockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'p-test-id',
  key: 'p-test',
  name: 'Test Project',
  location: 'Bogotá',
  budget: 1000000,
  status: 'IN_PROGRESS',
  createdDate: Date.now(),
  createdByUserId: 'u1',
  ...overrides,
});

describe('Projects Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProjectsStore.setState({ projects: [], hasHydrated: false });
  });

  test('estado inicial', () => {
    const { projects, hasHydrated } = useProjectsStore.getState();
    expect(projects).toEqual([]);
    expect(hasHydrated).toBe(false);
  });

  test('setProjects debe actualizar el estado', () => {
    const newProjects = [mockProject(), mockProject({ key: 'p2' })];
    useProjectsStore.getState().setProjects(newProjects);
    expect(useProjectsStore.getState().projects).toEqual(newProjects);
  });

  test('loadProjects debe llamar a onValue y actualizar proyectos', async () => {
    await useProjectsStore.getState().loadProjects();
    expect(onValue).toHaveBeenCalled();
    expect(useProjectsStore.getState().projects).toHaveLength(2);
  });

  test('maneja error en loadProjects con array vacío', async () => {
    (ref as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Connect error');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    await useProjectsStore.getState().loadProjects();
    expect(useProjectsStore.getState().projects).toEqual([]);
    consoleSpy.mockRestore();
  });
});
