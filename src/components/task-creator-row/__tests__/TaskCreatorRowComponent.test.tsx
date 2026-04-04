/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCreatorRowComponent } from '../TaskCreatorRowComponent';

// ─── Mocks de stores ─────────────────────────────────────────────────────────
const mockSetSnackbar = jest.fn();

jest.mock('../../../stores/tags/tags.store', () => ({
  useTagsStore: jest.fn((selector) => selector({ tags: ['tag1', 'tag2'] })),
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) => selector({
    users: [
      { key: 'user1', name: 'User One', isActive: true, permissions: [] },
      { key: 'user2', name: 'User Two', isActive: true, permissions: ['PROVIDER'] },
    ]
  })),
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector) => selector({
    workgroups: [
      { key: 'wg1', name: 'Grupo 1', isActive: true },
      { key: 'wg2', name: 'Grupo 2', isActive: false },
    ]
  })),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector) => selector({ setSnackbar: mockSetSnackbar })),
}));

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector) => selector({
    user: { key: 'admin', name: 'Admin', permissions: ['ADMIN'] }
  })),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/task.service', () => ({
  TaskService: {
    createTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Creada!' }),
  },
}));

jest.mock('../../../services/tags.service', () => ({
  TagsService: {
    createTag: jest.fn().mockResolvedValue({ result: 'OK' }),
  },
}));

// ─── Mocks de sub-componentes complejos ─────────────────────────────────────
jest.mock('../../dialogs/DialogueMultiselect', () => ({
  DialogueMultiselect: ({ title }: { title: string }) =>
    <div data-testid={`multiselect-${title}`}>{title}</div>,
}));

jest.mock('../../dialogs/DialogueCustomContent', () => ({
  DialogueCustomContent: ({ title, content }: { title: string; content: React.ReactNode }) => (
    <div data-testid={`dialog-${title}`}>{title}{content}</div>
  ),
}));

jest.mock('../../priority-input/PriorityInput', () => ({
  PriorityInput: () => <div data-testid="priority-input">Priority</div>,
}));

jest.mock('../../../utils/utils', () => ({
  getUserKeysByNames: jest.fn().mockReturnValue(['user1']),
  getUserNameByKey: jest.fn((key: string) => `User-${key}`),
}));

import React from 'react';

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TaskCreatorRowComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Renderizado inicial ───────────────────────────────────────────────────
  describe('renderizado inicial', () => {
    test('debe mostrar el botón "Nueva tarea" por defecto', () => {
      render(<TaskCreatorRowComponent />);
      expect(screen.getByText('Nueva tarea')).toBeInTheDocument();
    });

    test('no debe mostrar el formulario hasta que se haga click', () => {
      render(<TaskCreatorRowComponent />);
      expect(screen.queryByPlaceholderText('Nombre de la tarea...')).not.toBeInTheDocument();
    });
  });

  // ── Activación del formulario ─────────────────────────────────────────────
  describe('activación del formulario de creación', () => {
    test('debe mostrar el campo de texto al hacer click en "Nueva tarea"', () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      expect(screen.getByPlaceholderText('Nombre de la tarea...')).toBeInTheDocument();
    });

    test('debe mostrar el botón "Guardar" al abrir el formulario', () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    test('debe mostrar el botón "Cancelar" al abrir el formulario', () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  // ── Cancelar ──────────────────────────────────────────────────────────────
  describe('cancelar edición', () => {
    test('debe volver al botón "Nueva tarea" al hacer click en Cancelar', () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.getByText('Nueva tarea')).toBeInTheDocument();
    });
  });

  // ── Creación con nombre vacío ─────────────────────────────────────────────
  describe('validación al guardar', () => {
    test('debe mostrar snackbar de warning si el nombre está vacío', async () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'warning' })
        );
      });
    });

    test('no debe llamar a createTask si el nombre está vacío', async () => {
      const { TaskService } = require('../../../services/task.service');
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(TaskService.createTask).not.toHaveBeenCalled();
      });
    });
  });

  // ── Creación exitosa ──────────────────────────────────────────────────────
  describe('creación exitosa', () => {
    test('debe llamar a createTask con el nombre introducido', async () => {
      const { TaskService } = require('../../../services/task.service');
      render(<TaskCreatorRowComponent />);

      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea...'), {
        target: { value: 'Mi nueva tarea' },
      });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(TaskService.createTask).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Mi nueva tarea' }),
          'admin'
        );
      });
    });

    test('debe mostrar snackbar de éxito tras crear la tarea', async () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea...'), {
        target: { value: 'Tarea exitosa' },
      });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'success' })
        );
      });
    });

    test('debe resetear el formulario tras crear correctamente', async () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea...'), {
        target: { value: 'Tarea a resetear' },
      });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(screen.getByText('Nueva tarea')).toBeInTheDocument();
      });
    });
  });

  // ── Error de servicio ─────────────────────────────────────────────────────
  describe('manejo de errores del servicio', () => {
    test('debe mostrar snackbar de error si createTask devuelve ERROR', async () => {
      const { TaskService } = require('../../../services/task.service');
      TaskService.createTask.mockResolvedValueOnce({ result: 'ERROR', errorMessage: 'Fallo' });

      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea...'), {
        target: { value: 'Tarea con error' },
      });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error' })
        );
      });
    });

    test('debe manejar excepción inesperada de createTask', async () => {
      const { TaskService } = require('../../../services/task.service');
      TaskService.createTask.mockRejectedValueOnce(new Error('Network error'));

      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      fireEvent.change(screen.getByPlaceholderText('Nombre de la tarea...'), {
        target: { value: 'Tarea con excepción' },
      });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error' })
        );
      });
    });
  });

  // ── Sub-componentes ───────────────────────────────────────────────────────
  describe('sub-componentes', () => {
    test('debe renderizar los diálogos al activar el formulario', () => {
      render(<TaskCreatorRowComponent />);
      fireEvent.click(screen.getByText('Nueva tarea'));
      expect(screen.getByTestId('priority-input')).toBeInTheDocument();
    });
  });
});
