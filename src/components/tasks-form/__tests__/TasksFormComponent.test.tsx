/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksFormComponent } from '../TasksFormComponent';
import React from 'react';

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetSnackbar = jest.fn();
const mockSetModal = jest.fn();
const mockSetIsLoading = jest.fn();

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) => selector({
    users: [
      { key: 'u1', name: 'Alice', isActive: true, permissions: [] },
      { key: 'u2', name: 'Bob', isActive: false, permissions: [] },
      { key: 'u3', name: 'Charlie', isActive: true, permissions: ['PROVIDER'] },
    ]
  })),
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector) => selector({
    workgroups: [
      { key: 'wg1', name: 'Grupo Alpha', isActive: true },
      { key: 'wg2', name: 'Grupo Beta', isActive: false },
    ]
  })),
}));

jest.mock('../../../stores/tags/tags.store', () => ({
  useTagsStore: jest.fn((selector) => selector({ tags: ['frontend', 'backend', 'testing'] })),
}));

jest.mock('../../../stores', () => ({
  useAuthStore: jest.fn((selector) => selector({
    user: { key: 'admin-key', name: 'Admin', permissions: ['ADMIN'] }
  })),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector) => selector({
    setIsLoading: mockSetIsLoading,
    modal: { open: false },
    setModal: mockSetModal,
    snackbar: { open: false },
    setSnackbar: mockSetSnackbar,
  })),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/task.service', () => ({
  TaskService: {
    createTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Tarea creada!' }),
  },
}));

jest.mock('../../../services/tags.service', () => ({
  TagsService: { createTag: jest.fn() },
}));

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  const ReactLib = require('react');

  return {
    ...actual,
    Autocomplete: ({ options = [], onChange, renderInput, PaperComponent }: any) => {
      const [inputValue, setInputValue] = ReactLib.useState('');

      const params = {
        inputProps: {
          value: inputValue,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(event.target.value),
        },
      };

      const optionsContent = (
        <div>
          {(options as string[]).map((opt) => (
            <button key={opt} type="button" onClick={() => onChange?.(null, opt)}>
              mock-option-{opt}
            </button>
          ))}
        </div>
      );

      return (
        <div data-testid="mock-autocomplete">
          {renderInput(params)}
          {PaperComponent ? <PaperComponent>{optionsContent}</PaperComponent> : optionsContent}
        </div>
      );
    },
    Chip: ({ label, onDelete }: any) => (
      <div>
        <span>{label}</span>
        <button type="button" aria-label={`delete-${label}`} onClick={onDelete}>
          delete
        </button>
      </div>
    ),
    Select: ({ children, onChange }: any) => (
      <div>
        <button type="button" onClick={() => onChange?.({ target: { value: 'URGENT' } })}>
          mock-priority-change
        </button>
        {children}
      </div>
    ),
    MenuItem: ({ children }: any) => <div>{children}</div>,
  };
});

// ─── Mocks de sub-componentes ────────────────────────────────────────────────
jest.mock('../../multi-select/MultiselectComponent', () => ({
  MultiselectComponent: ({ title }: { title: string }) => (
    <div data-testid={`multiselect-${title}`}>{title}</div>
  ),
}));

jest.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ onChange }: { onChange?: (value: { format: (fmt: string) => string } | null) => void }) => (
    <button
      type="button"
      data-testid="date-picker"
      onClick={() => onChange?.({ format: () => '01/01/2026' })}
    >
      DatePicker
    </button>
  ),
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: class {},
}));

jest.mock('../../../utils/utils', () => ({
  getUserKeysByNames: jest.fn().mockReturnValue(['u1']),
  getUserNameByKey: jest.fn((key: string) => `User-${key}`),
  getWorkgroupNameByKey: jest.fn((key: string) => `WG-${key}`),
}));

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('TasksFormComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Renderizado ──────────────────────────────────────────────────────────
  describe('renderizado', () => {
    test('debe renderizar sin errores', () => {
      render(<TasksFormComponent />);
      expect(document.body).toBeTruthy();
    });

    test('debe mostrar el campo Nombre de la Tarea', () => {
      render(<TasksFormComponent />);
      expect(screen.getByLabelText(/Nombre de la Tarea/i)).toBeInTheDocument();
    });

    test('debe mostrar el botón Crear Tarea', () => {
      render(<TasksFormComponent />);
      expect(screen.getByRole('button', { name: /Crear Tarea/i })).toBeInTheDocument();
    });

    test('debe mostrar el multiselect de Responsables', () => {
      render(<TasksFormComponent />);
      expect(screen.getByTestId('multiselect-Responsables Asignados')).toBeInTheDocument();
    });

    test('debe mostrar el multiselect de Grupos de Trabajo', () => {
      render(<TasksFormComponent />);
      expect(screen.getByTestId('multiselect-Grupos de Trabajo')).toBeInTheDocument();
    });

    test('debe mostrar el campo de Notas Adicionales', () => {
      render(<TasksFormComponent />);
      expect(screen.getByLabelText(/Notas Adicionales/i)).toBeInTheDocument();
    });

    test('debe mostrar el select de Prioridad con valor LOW por defecto', () => {
      render(<TasksFormComponent />);
      expect(screen.getByText('Baja')).toBeInTheDocument();
    });
  });

  // ── Prop workgroupKey ─────────────────────────────────────────────────────
  describe('prop workgroupKey', () => {
    test('debe renderizar correctamente con workgroupKey', () => {
      render(<TasksFormComponent workgroupKey="wg1" />);
      expect(screen.getByLabelText(/Nombre de la Tarea/i)).toBeInTheDocument();
    });

    test('debe renderizar sin workgroupKey (undefined)', () => {
      render(<TasksFormComponent />);
      expect(screen.getByLabelText(/Nombre de la Tarea/i)).toBeInTheDocument();
    });
  });

  // ── Submit sin usuario ────────────────────────────────────────────────────
  describe('submit sin usuario autenticado', () => {
    test('debe mostrar snackbar de error si no hay usuario', async () => {
      const { useAuthStore } = require('../../../stores');
      useAuthStore.mockImplementation((selector: Function) =>
        selector({ user: null })
      );

      render(<TasksFormComponent />);
      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Test task' },
      });
      fireEvent.submit(screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!);

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error' })
        );
      });
    });
  });

  // ── Submit exitoso ────────────────────────────────────────────────────────
  describe('submit exitoso', () => {
    beforeEach(() => {
      const { useAuthStore } = require('../../../stores');
      useAuthStore.mockImplementation((selector: Function) =>
        selector({ user: { key: 'admin-key', name: 'Admin' } })
      );
    });

    test('debe llamar a createTask al enviar el formulario con nombre válido', async () => {
      const { TaskService } = require('../../../services/task.service');
      render(<TasksFormComponent />);

      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Nueva Tarea Test' },
      });

      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(TaskService.createTask).toHaveBeenCalled();
      });
    });

    test('debe mostrar snackbar de éxito al crear correctamente', async () => {
      const { TaskService } = require('../../../services/task.service');
      TaskService.createTask.mockResolvedValueOnce({ result: 'OK' });
      render(<TasksFormComponent />);

      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Tarea OK' },
      });
      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'success' })
        );
      });
    });

    test('debe llamar a setIsLoading(true) al iniciar y setIsLoading(false) al terminar', async () => {
      render(<TasksFormComponent />);
      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Tarea loading' },
      });
      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSetIsLoading).toHaveBeenCalledWith(true);
        expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  // ── Submit con error del servicio ─────────────────────────────────────────
  describe('submit con error del servicio', () => {
    beforeEach(() => {
      const { useAuthStore } = require('../../../stores');
      useAuthStore.mockImplementation((selector: Function) =>
        selector({ user: { key: 'admin-key', name: 'Admin' } })
      );
    });

    test('debe mostrar snackbar de error si createTask devuelve ERROR', async () => {
      const { TaskService } = require('../../../services/task.service');
      TaskService.createTask.mockResolvedValueOnce({
        result: 'ERROR',
        errorMessage: 'Fallo en la BD',
      });

      render(<TasksFormComponent />);
      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Tarea error' },
      });
      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error' })
        );
      });
    });

    test('debe mostrar snackbar de error ante excepción inesperada', async () => {
      const { TaskService } = require('../../../services/task.service');
      TaskService.createTask.mockRejectedValueOnce(new Error('Crash'));

      render(<TasksFormComponent />);
      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Tarea crash' },
      });
      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error' })
        );
      });
    });
  });

  describe('interacciones de etiquetas, fecha y prioridad', () => {
    test('agrega y elimina etiqueta existente usando el flujo del selector', async () => {
      const { TagsService } = require('../../../services/tags.service');
      render(<TasksFormComponent />);

      fireEvent.click(screen.getByRole('button', { name: 'mock-option-backend' }));
      fireEvent.click(screen.getByRole('button', { name: 'mock-option-backend' }));

      expect(screen.getByText('backend')).toBeInTheDocument();
      expect(TagsService.createTag).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'delete-backend' }));
      await waitFor(() => {
        expect(screen.queryByText('backend')).not.toBeInTheDocument();
      });
    });

    test('crea una etiqueta nueva desde el botón + cuando no existe en catálogo', async () => {
      const { TagsService } = require('../../../services/tags.service');
      render(<TasksFormComponent />);

      fireEvent.change(screen.getByLabelText(/Buscar o crear etiqueta/i), {
        target: { value: 'etiqueta-nueva' },
      });

      const autoCompleteContainer = screen.getByTestId('mock-autocomplete');
      fireEvent.click(autoCompleteContainer.querySelector('button') as HTMLButtonElement);

      await waitFor(() => {
        expect(TagsService.createTag).toHaveBeenCalledWith('etiqueta-nueva');
      });
      expect(screen.getByText('etiqueta-nueva')).toBeInTheDocument();
    });

    test('envía dueDate y prioridad actualizada al crear tarea', async () => {
      const { TaskService } = require('../../../services/task.service');
      render(<TasksFormComponent />);

      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Tarea con fecha y prioridad' },
      });
      fireEvent.click(screen.getByTestId('date-picker'));
      fireEvent.click(screen.getByRole('button', { name: 'mock-priority-change' }));

      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(TaskService.createTask).toHaveBeenCalledWith(
          expect.objectContaining({
            dueDate: '01/01/2026',
            priority: 'URGENT',
          })
        );
      });
    });
  });

  describe('ramas adicionales de submit', () => {
    test('envía ownerKeys vacío cuando getUserKeysByNames retorna vacío', async () => {
      const { TaskService } = require('../../../services/task.service');
      const utils = require('../../../utils/utils');
      utils.getUserKeysByNames.mockReturnValueOnce([]);

      render(<TasksFormComponent />);
      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Sin responsables' },
      });

      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(TaskService.createTask).toHaveBeenCalledWith(
          expect.objectContaining({ ownerKeys: [] })
        );
      });
    });

    test('tolera workgroups undefined y envía workgroupKeys undefined', async () => {
      const { TaskService } = require('../../../services/task.service');
      const { useWorkgroupStore } = require('../../../stores/workgroups/workgroups.store');

      useWorkgroupStore.mockImplementationOnce((selector: Function) => selector({ workgroups: undefined }));

      render(<TasksFormComponent />);
      fireEvent.change(screen.getByLabelText(/Nombre de la Tarea/i), {
        target: { value: 'Sin grupos' },
      });

      const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(TaskService.createTask).toHaveBeenCalledWith(
          expect.objectContaining({ workgroupKeys: undefined })
        );
      });
    });
  });
});
