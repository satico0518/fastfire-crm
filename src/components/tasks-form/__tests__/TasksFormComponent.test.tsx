/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksFormComponent } from '../TasksFormComponent';

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
  useAuhtStore: jest.fn((selector) => selector({
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

// ─── Mocks de sub-componentes ────────────────────────────────────────────────
jest.mock('../../multi-select/MultiselectComponent', () => ({
  MultiselectComponent: ({ title }: { title: string }) => (
    <div data-testid={`multiselect-${title}`}>{title}</div>
  ),
}));

jest.mock('@mui/x-date-pickers', () => ({
  DatePicker: () => <div data-testid="date-picker">DatePicker</div>,
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

import React from 'react';

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
      const { useAuhtStore } = require('../../../stores');
      useAuhtStore.mockImplementation((selector: Function) =>
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
      const { useAuhtStore } = require('../../../stores');
      useAuhtStore.mockImplementation((selector: Function) =>
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
      const { useAuhtStore } = require('../../../stores');
      useAuhtStore.mockImplementation((selector: Function) =>
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
});
