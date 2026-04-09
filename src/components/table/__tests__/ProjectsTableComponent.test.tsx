/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectsTable from '../ProjectsTableComponent';
import { Project } from '../../../interfaces/Project';

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockProjects: Project[] = [
  {
    id: 'p1-id', key: 'p1', name: 'Alpha Project', location: 'Bogotá', budget: 1000,
    status: 'IN_PROGRESS', createdDate: Date.now(), createdByUserId: 'u1',
  },
  {
    id: 'p2-id', key: 'p2', name: 'Beta Project', location: 'Medellín', budget: 2000,
    status: 'DONE', createdDate: Date.now(), createdByUserId: 'u1',
  },
];

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetSnackbar = jest.fn();
const mockSetConfirmation = jest.fn();
const mockSetModal = jest.fn();

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setSnackbar: mockSetSnackbar,
      setConfirmation: mockSetConfirmation,
      modal: { open: false },
      setModal: mockSetModal,
    })
  ),
}));

jest.mock('../../../stores/projects/projects.store', () => ({
  useProjectsStore: jest.fn((selector: Function) => selector({ projects: mockProjects })),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
jest.mock('../../../services/project.service', () => ({
  ProjectService: {
    deleteProject: jest.fn().mockResolvedValue({ result: 'OK' }),
    updateProject: jest.fn().mockResolvedValue({ result: 'OK' }),
  },
}));

// ─── Mock DataGrid ───────────────────────────────────────────────────────────
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: jest.fn(({ rows, columns }) => (
    <table role="grid">
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.field}>{col.headerName || col.field}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.key}>
            {columns.map((col: any) => (
              <td key={col.field}>
                {col.type === 'actions'
                  ? col.getActions?.({ row, id: row.key })
                  : col.renderCell
                    ? col.renderCell({ row, value: row[col.field] })
                    : String(row[col.field] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )),
  GridActionsCellItem: jest.fn(({ label, onClick }: any) => (
    <button type="button" aria-label={label} onClick={onClick}>{label}</button>
  )),
}));

// ── Mock del ProjectsFormComponent ───────────────────────────────────────────
jest.mock('../../projects-form/ProjectsFormComponent', () => ({
  ProjectsFormComponent: ({ editingProject }: any) => (
    <div data-testid="project-form-edit">{editingProject?.name}</div>
  ),
}));

// ── Suite ────────────────────────────────────────────────────────────────────
describe('ProjectsTableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Renderizado ──────────────────────────────────────────────────────────
  describe('renderizado', () => {
    test('debe mostrar el grid de proyectos', () => {
      render(<ProjectsTable />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    test('debe mostrar los nombres de los proyectos', () => {
      render(<ProjectsTable />);
      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      expect(screen.getByText('Beta Project')).toBeInTheDocument();
    });

    test('debe tachar el texto de proyectos finalizados', () => {
      render(<ProjectsTable />);
      const betaRowText = screen.getByText('Beta Project');
      expect(betaRowText.style.textDecoration).toBe('line-through');
    });
  });

  // ── Acciones de modales ──────────────────────────────────────────────────
  describe('modales', () => {
    test('debe abrir modal de edición al hacer click en Modificar', () => {
      render(<ProjectsTable />);
      fireEvent.click(screen.getAllByLabelText('Modificar')[0]);
      expect(mockSetModal).toHaveBeenCalledWith(
        expect.objectContaining({ open: true, title: 'Modificar Proyecto' })
      );
    });

    test('debe abrir confirmación al hacer click en Eliminar', () => {
      render(<ProjectsTable />);
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);
      expect(mockSetConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ open: true, title: 'Confirmación!' })
      );
    });

    test('debe llamar a deleteProject al confirmar eliminación', async () => {
      const { ProjectService } = require('../../../services/project.service');
      render(<ProjectsTable />);
      fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);

      // Extraer y renderizar el botón de acción del diálogo
      const actionsJSX = (mockSetConfirmation as jest.Mock).mock.calls[0][0].actions;
      render(actionsJSX);
      // El de la tabla ya estaba, el nuevo es el del diálogo. Usamos el último.
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);

      await act(async () => {
        expect(ProjectService.deleteProject).toHaveBeenCalledWith('p1');
      });
    });
  });

  // ── Acciones de estado (Bloquear/Finalizar/Reiniciar) ────────────────────
  describe('acciones de estado', () => {
    test('debe permitir bloquear un proyecto en progreso', async () => {
      const { ProjectService } = require('../../../services/project.service');
      render(<ProjectsTable />);
      fireEvent.click(screen.getAllByLabelText('Bloquear')[0]);
      expect(ProjectService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'BLOCKED' })
      );
    });

    test('debe permitir finalizar un proyecto en progreso', async () => {
      const { ProjectService } = require('../../../services/project.service');
      render(<ProjectsTable />);
      fireEvent.click(screen.getAllByLabelText('Finalizar')[0]);
      expect(ProjectService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'DONE' })
      );
    });

    test('debe permitir reiniciar un proyecto finalizado', async () => {
      const { ProjectService } = require('../../../services/project.service');
      render(<ProjectsTable />);
      // El proyecto Beta (índice 1) está DONE, el botón de reiniciar aparece como PlayCircle en la columna Estado
      // Pero el GridActionsCellItem para Reiniciar no está en DONE?
      // Revisando ProjectsTableComponent.tsx linea 150: if (status === DONE) return baseActions
      // Así que DONE no tiene botón Reiniciar en baseActions, pero sí en la col de Estado.
      // Vamos a buscar el botón con título "Reiniciar" que es un IconButton
      const restartBtn = screen.getByTitle('Reiniciar');
      fireEvent.click(restartBtn);
      expect(ProjectService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'IN_PROGRESS' })
      );
    });
  });
});
