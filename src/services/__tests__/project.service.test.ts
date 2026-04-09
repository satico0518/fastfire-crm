import { ProjectService } from '../project.service';
import * as Firebase from 'firebase/database';
import { Project } from '../../interfaces/Project';

jest.mock('firebase/database');

const mockProject: Project = {
  id: 'p1-id',
  key: 'p1',
  name: 'Test Project',
  location: 'Bogotá',
  budget: 1000000,
  status: 'IN_PROGRESS',
  createdDate: Date.now(),
  createdByUserId: 'u1',
};

describe('ProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Firebase.ref as jest.Mock).mockReturnValue({});
    (Firebase.update as jest.Mock).mockResolvedValue({ result: 'OK' });
    (Firebase.set as jest.Mock).mockResolvedValue(undefined);
    (Firebase.push as jest.Mock).mockReturnValue({ key: 'new-p-key' });
  });

  test('createProject debe llamar a push y set', async () => {
    const result = await ProjectService.createProject(mockProject);
    expect(Firebase.push).toHaveBeenCalled();
    expect(Firebase.set).toHaveBeenCalled();
    expect(result.result).toBe('OK');
  });

  test('updateProject debe llamar a update en el path correcto', async () => {
    const result = await ProjectService.updateProject(mockProject);
    expect(Firebase.ref).toHaveBeenCalledWith(expect.anything(), `projects/${mockProject.key}`);
    expect(Firebase.update).toHaveBeenCalledWith(expect.anything(), mockProject);
    expect(result.result).toBe('OK');
  });

  test('deleteProject debe llamar a update con status DELETED', async () => {
    const result = await ProjectService.deleteProject('p1');
    expect(Firebase.update).toHaveBeenCalledWith(expect.anything(), { status: 'DELETED' });
    expect(result.result).toBe('OK');
  });

  test('maneja errores en createProject', async () => {
    (Firebase.set as jest.Mock).mockRejectedValueOnce(new Error('Fail'));
    const result = await ProjectService.createProject(mockProject);
    expect(result.result).toBe('ERROR');
  });

  test('maneja errores en updateProject', async () => {
    (Firebase.update as jest.Mock).mockRejectedValueOnce(new Error('Fail'));
    const result = await ProjectService.updateProject(mockProject);
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeDefined();
  });

  test('maneja errores en deleteProject', async () => {
    (Firebase.update as jest.Mock).mockRejectedValueOnce(new Error('Fail'));
    const result = await ProjectService.deleteProject('p1');
    expect(result.result).toBe('ERROR');
    expect(result.errorMessage).toBeDefined();
  });
});
