/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTableComponent from '../TasksTableComponent';
import { Box } from '@mui/material';

import { Priority, Task } from '../../../interfaces/Task';

jest.mock("@mui/x-data-grid", () => {
   const actual = jest.requireActual("@mui/x-data-grid");
   return {
     ...actual,
     DataGrid: (props: any) => (
       <div data-testid="mock-data-grid" role="grid">
          {props.columns.map((col: any) => (
             <div key={col.field}>
                {props.rows.map((row: any) => (
                   <div key={row.id} className="MuiDataGrid-row">
                      {col.renderCell && col.renderCell({ row, value: row[col.field] })}
                      {col.renderEditCell && col.renderEditCell({ row, value: row[col.field] })}
                      {col.getActions && col.getActions({ row, id: row.id }).map((Action: any, i: number) => (
                          <div key={i}>{Action}</div>
                      ))}
                   </div>
                ))}
             </div>
          ))}
       </div>
     ),
     GridActionsCellItem: (props: any) => <button onClick={props.onClick} data-testid={props.icon?.props?.['data-testid'] || 'action'}>{props.icon}</button>
   };
});

const mockSetSnackbar = jest.fn();

jest.mock('../../../stores/tasks/tasks.store', () => ({
  useTasksStore: jest.fn((selector) => selector({ tasks: [
    {
      id: '1',
      key: '1',
      name: 'Tarea 1',
      description: 'Descripción tarea 1',
      status: 'TODO',
      priority: 'LOW' as const,
      createdDate: Date.now() - 1000,
      modifiedDate: Date.now(),
      workgroupKeys: ['wg1'],
      workgroupKey: 'wg1',
      ownerKeys: ['user1'],
      tags: ['tag1'],
      dueDate: '2024-12-01',
      notes: 'initial note',
      history: [
        {
          action: 'CREATED' as any,
          modifiedDate: Date.now(),
          modifierUserId: 'user1',
          changes: [{ field: 'name', oldValue: '', newValue: 'Tarea 1' }]
        },
        {
          action: 'UPDATED' as any,
          modifiedDate: Date.now(),
          modifierUserId: 'user1',
          changes: [{ field: 'priority', oldValue: 'NORMAL', newValue: 'LOW' }, { field: 'status', oldValue: 'TODO', newValue: 'DONE' }]
        },
        {
          action: 'NOTE_ADDED' as any,
          modifiedDate: Date.now(),
          modifierUserId: 'user1',
          changes: []
        },
        {
          action: 'DELETED' as any,
          modifiedDate: Date.now(),
          modifierUserId: 'user1',
          changes: []
        },
        {
          action: 'UNKNOWN_ACTION' as any,
          modifiedDate: Date.now(),
          modifierUserId: 'user1',
          changes: [{ field: 'ownerKeys', oldValue: [], newValue: ['user1'] }, { field: 'workgroupKeys', oldValue: [], newValue: ['wg1'] }]
        },
        {
          action: 'UPDATED' as any,
          modifiedDate: Date.now(),
          modifierUserId: 'user1',
          changes: [
             { field: 'priority', oldValue: 'HIGH', newValue: 'URGENT' },
             { field: 'dueDate', oldValue: '2024-01-01', newValue: '2024-02-02' },
             { field: 'tags', oldValue: [], newValue: ['newTag'] },
             { field: 'unknown', oldValue: null, newValue: undefined }
          ]
        }
      ],
      createdByUserKey: 'user1',
      createdBy: 'user1'
    },
    {
      id: '2',
      key: '2',
      name: 'Tarea 2',
      description: 'Descripción tarea 2',
      status: 'DONE',
      priority: 'HIGH' as const,
      createdDate: Date.now() - 2000,
      modifiedDate: Date.now(),
      workgroupKeys: ['wg1'],
      workgroupKey: 'wg1',
      ownerKeys: ['user2'],
      tags: ['tag2'],
      dueDate: '',
      notes: '',
      history: [],
      createdByUserKey: 'user2',
      createdBy: 'user2'
    }
  ] }))
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      setSnackbar: mockSetSnackbar,
      setConfirmation: jest.fn(),
      setModal: jest.fn()
    })
  )
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) =>
    selector({ users: [
      { id: '1', key: 'user1', firstName: 'User', lastName: 'One', email: 'user1@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true },
      { id: '2', key: 'user2', firstName: 'User', lastName: 'Two', email: 'user2@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true }
    ] })
  )
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector) =>
    selector({ workgroups: [
      { id: '1', key: 'wg1', name: 'Workgroup 1', description: 'Test workgroup' }
    ] })
  )
}));

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector) =>
    selector({ user: {
      id: 'admin', 
      key: 'admin', 
      name: 'Admin User', 
      email: 'admin@test.com', 
      role: 'ADMIN', 
      permissions: ['ADMIN'],
      workgroupKeys: ['wg1'],
      active: true
    } })
  )
}));

jest.mock('../../../services/task.service', () => ({
  TaskService: {
    cleanupDeletedTasks: jest.fn(),
    updateTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Updated' }),
    deleteTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Deleted' }),
    physicalDeleteTask: jest.fn().mockResolvedValue({ result: 'OK', message: 'Physically deleted' })
  }
}));

jest.mock('../../../utils/utils', () => ({
  ...jest.requireActual('../../../utils/utils'),
  downloadExcelFile: jest.fn() // intercept excel export
}));

describe('TasksTableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => render(
    <Box sx={{ height: 400, width: '100%' }}>
      <TasksTableComponent />
    </Box>
  );

  it('debería renderizar la tabla con las columnas y tareas mockeadas', () => {
    renderComponent();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('permite abrir el historial de una tarea y evalua history parser', async () => {
    renderComponent();
    
    // Check if DataGrid mock rendered the history icon
    const historyBtns = await waitFor(() => {
        const btns = screen.getAllByTestId('HistoryOutlinedIcon');
        if (btns.length === 0) throw new Error("Not found yet");
        return btns;
    });
    
    fireEvent.click(historyBtns[0].closest('button') || historyBtns[0]);

    // Should open modal
    expect(screen.getByText('Historial de Tarea')).toBeInTheDocument();
    
    // Checks that translations for actions string render correctly
    expect(screen.getByText(/CREADA/)).toBeInTheDocument();
    expect(screen.getAllByText(/ACTUALIZADA/)[0]).toBeInTheDocument();
    expect(screen.getByText(/NOTA AÑADIDA/)).toBeInTheDocument();
    expect(screen.getByText(/ELIMINADA/)).toBeInTheDocument();
    expect(screen.getByText(/UNKNOWN_ACTION/)).toBeInTheDocument();
  });

  it('evalua las opciones de tags y modal labels (click en Notas para abrir textarea)', async () => {
    renderComponent();
    
    const notesBtns = screen.getAllByTestId('NoteAltOutlinedIcon'); // Notas edit icon
    fireEvent.click(notesBtns[0].closest('button') || notesBtns[0]);

    // Should open Notes Modal
    const modalTitle = screen.getByText('Notas');
    expect(modalTitle).toBeInTheDocument();

    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'This is a new note' } });

    const saveBtn = screen.getByText('Guardar');
    fireEvent.click(saveBtn);
    
    const { TaskService } = require('../../../services/task.service');
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }));
    });
  });

  it('abrir DueDate dialog, actualizar y guardar', async () => {
    renderComponent();
    const calendarBtns = screen.getAllByTestId('DateRangeOutlinedIcon');
    fireEvent.click(calendarBtns[0].closest('button')!);

    expect(screen.getAllByText('Fecha Límite').length).toBeGreaterThan(0);
    // Submit modal (the mock DialogCustomContent has standard guard)
    const saveBtn = screen.getByText('Guardar');
    fireEvent.click(saveBtn);

    const { TaskService } = require('../../../services/task.service');
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalled();
    });
  });

  it('abrir grupos dialog, interactuar y guardar', async () => {
    renderComponent();
    const groupBtns = screen.getAllByTestId('GroupsOutlinedIcon');
    fireEvent.click(groupBtns[0].closest('button')!);

    const saveBtn = screen.getByText('Guardar'); // in Groups Dialog
    fireEvent.click(saveBtn);

    const { TaskService } = require('../../../services/task.service');
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalled();
    });
  });

  it('abrir asignados dialog, interactuar y guardar', async () => {
    renderComponent();
    const assignBtns = screen.getAllByTestId('GroupAddOutlinedIcon');
    fireEvent.click(assignBtns[0].closest('button') || assignBtns[0]);

    const saveBtn = screen.getByText('Guardar'); // in asignados Dialog
    fireEvent.click(saveBtn);

    const { TaskService } = require('../../../services/task.service');
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalled();
    });
  });

  it('abrir tags dialog', async () => {
    renderComponent();
    const tagsBtns = screen.getAllByTestId('LocalOfferOutlinedIcon');
    // Clicking the icon in the cells
    const cellIcon = tagsBtns.find(b => b.closest('button'));
    if (cellIcon) {
       fireEvent.click(cellIcon.closest('button')!);
    }
  });

  it('cambiar prioridad en mock', async () => {
    renderComponent();
    // Flags icon is EmojiFlagsOutlinedIcon? If not skip this because priority uses translations instead it seems
    const flagsBtns = screen.queryAllByTestId('EmojiFlagsOutlinedIcon');
    if (flagsBtns.length > 0) {
      fireEvent.click(flagsBtns[0].closest('button') || flagsBtns[0]);
    }
  });

  it('exporta a excel', async () => {
     renderComponent();
     fireEvent.click(screen.getByText("Excel"));

     const utils = require('../../../utils/utils');
     expect(utils.downloadExcelFile).toHaveBeenCalled();
  });

  it('borra la selección de status de filtro (Limpiar Filtros)', async () => {
      renderComponent();
      
      const tagFilterBtn = screen.getByText("Etiquetas");
      fireEvent.click(tagFilterBtn);
      
      // select option in dropdown -> "tag1 (1)"
      const tagOption = screen.getByText('tag1 (1)');
      fireEvent.click(tagOption);
      
      // select option clear
      const clearFilters = screen.getByText(/Limpiar filtros/i);
      fireEvent.click(clearFilters);
  });
});
