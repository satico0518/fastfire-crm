import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectsFormComponent } from '../ProjectsFormComponent';
import { Project } from '../../../interfaces/Project';

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetIsLoading = jest.fn();
const mockSetSnackbar = jest.fn();
const mockSetModal = jest.fn();

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setIsLoading: mockSetIsLoading,
      setSnackbar: mockSetSnackbar,
      modal: { open: true },
      setModal: mockSetModal,
      snackbar: { open: false },
    })
  ),
}));

jest.mock('../../../stores/cities/cities.store', () => ({
  useCitiesStore: jest.fn((selector: Function) =>
    selector({
      cities: [
        { key: 'c1', label: 'Bogotá' },
        { key: 'c2', label: 'Medellín' },
      ],
    })
  ),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/project.service', () => ({
  ProjectService: {
    createProject: jest.fn().mockResolvedValue({ result: 'OK' }),
    updateProject: jest.fn().mockResolvedValue({ result: 'OK' }),
  },
}));

// ── Mock Autocomplete ─────────────────────────────────────────────────────────
// Autocomplete de MUI es complejo de testear, así que mockeamos la entrada
jest.mock('@mui/material/Autocomplete', () => ({
  __esModule: true,
  default: ({ onChange, options, renderInput }: any) => (
    <div data-testid="autocomplete-mock">
      {renderInput({
        inputProps: { 'data-testid': 'autocomplete-input' },
        InputProps: { endAdornment: null },
        disabled: false,
        fullWidth: true,
        size: 'medium',
      })}
      <button type="button" onClick={() => onChange(null, options[0])}>Select Bogotá</button>
    </div>
  ),
}));

const mockEditingProject: Project = {
  id: 'p1-id', key: 'p1', name: 'Existing Project', location: 'Bogotá', budget: 5000,
  status: 'IN_PROGRESS', createdDate: Date.now(), createdByUserId: 'u1',
};

describe('ProjectsFormComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderizado en modo creación', () => {
    render(<ProjectsFormComponent />);
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicacion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Presupuesto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Proyecto/i })).toBeInTheDocument();
  });

  test('renderizado en modo edición', () => {
    render(<ProjectsFormComponent editingProject={mockEditingProject} />);
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue('Existing Project');
    expect(screen.getByRole('button', { name: /Modificar Proyecto/i })).toBeInTheDocument();
  });

  test('creación exitosa de proyecto', async () => {
    const { ProjectService } = require('../../../services/project.service');
    render(<ProjectsFormComponent />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Proyecto Nuevo' } });
    fireEvent.change(screen.getByLabelText(/Ubicacion/i), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByLabelText(/Presupuesto/i), { target: { value: '1000' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Crear Proyecto/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(ProjectService.createProject).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' })
      );
    });
  });

  test('edición exitosa de proyecto', async () => {
    const { ProjectService } = require('../../../services/project.service');
    render(<ProjectsFormComponent editingProject={mockEditingProject} />);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Modificar Proyecto/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(ProjectService.updateProject).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' })
      );
    });
  });

  test('manejo de error del servicio en creación', async () => {
    const { ProjectService } = require('../../../services/project.service');
    ProjectService.createProject.mockRejectedValueOnce(new Error('Fail'));
    render(<ProjectsFormComponent />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Proyecto Fallido' } });
    fireEvent.change(screen.getByLabelText(/Ubicacion/i), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByLabelText(/Presupuesto/i), { target: { value: '1000' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Crear Proyecto/i }).closest('form')!);
    });

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' })
      );
    });
  });
});
