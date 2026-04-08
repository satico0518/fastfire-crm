/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTableComponent from '../TasksTableComponent';
import { Box } from '@mui/material';

jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
  DatePicker: ({ label, onChange }: any) => (
    <button data-testid="mock-date-picker" onClick={() => onChange(require('dayjs')('2025-01-01'))}>
      {label}
    </button>
  ),
}));

jest.mock('../../priority-input/PriorityInput', () => ({
  PriorityInput: ({ okAction, setPriority }: any) => (
    <button
      type="button"
      data-testid="priority-input"
      onClick={() => {
        setPriority('URGENT');
        okAction?.();
      }}
    >
      Priority
    </button>
  ),
}));

jest.mock("@mui/x-data-grid", () => {
  const React = require('react');
   const actual = jest.requireActual("@mui/x-data-grid");
   return {
     ...actual,
    DataGrid: (props: any) => {
     (globalThis as any).__tasksTableGridProps = props;
     React.useEffect(() => {
      props.onFilterModelChange?.({ items: [] });
     }, []);

     const rowsLabel = props.localeText?.MuiTablePagination?.labelDisplayedRows?.({
      from: 1,
      to: 1,
      count: props.rows?.length ?? 0,
     });
     const selectedLabel = props.localeText?.footerRowSelected?.(2);

     return (
      <div data-testid="mock-data-grid" role="grid">
        <span>{rowsLabel}</span>
        <span>{selectedLabel}</span>
        {props.columns.map((col: any) => (
          <div key={col.field}>
            {props.rows.map((row: any) => (
              <div key={row.id} className="MuiDataGrid-row">
                {col.valueGetter && <span>{String(col.valueGetter(null, row))}</span>}
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
     );
    },
     GridActionsCellItem: (props: any) => <button onClick={props.onClick} data-testid={props.icon?.props?.['data-testid'] || 'action'}>{props.icon}</button>
   };
});

const mockSetSnackbar = jest.fn();
const mockSetConfirmation = jest.fn();
const mockSetModal = jest.fn();

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
      setConfirmation: mockSetConfirmation,
      setModal: mockSetModal
    })
  )
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) =>
    selector({ users: [
      { id: '1', key: 'user1', firstName: 'User', lastName: 'One', email: 'user1@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true, isActive: true, avatarURL: 'https://img.test/u1.png' },
      { id: '2', key: 'user2', firstName: 'User', lastName: 'Two', email: 'user2@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true, isActive: true }
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

    const { useTasksStore } = require('../../../stores/tasks/tasks.store');
    const { useUiStore } = require('../../../stores/ui/ui.store');
    const { useUsersStore } = require('../../../stores/users/users.store');
    const { useWorkgroupStore } = require('../../../stores/workgroups/workgroups.store');
    const { useAuhtStore } = require('../../../stores');
    const { TaskService } = require('../../../services/task.service');

    useTasksStore.mockImplementation((selector: any) => selector({ tasks: [
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
    ] }));

    useUiStore.mockImplementation((selector: any) =>
      selector({ setSnackbar: mockSetSnackbar, setConfirmation: mockSetConfirmation, setModal: mockSetModal })
    );

    useUsersStore.mockImplementation((selector: any) =>
      selector({ users: [
        { id: '1', key: 'user1', firstName: 'User', lastName: 'One', email: 'user1@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true, isActive: true, avatarURL: 'https://img.test/u1.png' },
        { id: '2', key: 'user2', firstName: 'User', lastName: 'Two', email: 'user2@test.com', role: 'USER', permissions: [], workgroupKeys: ['wg1'], active: true, isActive: true }
      ] })
    );

    useWorkgroupStore.mockImplementation((selector: any) =>
      selector({ workgroups: [
        { id: '1', key: 'wg1', name: 'Workgroup 1', description: 'Test workgroup' }
      ] })
    );

    useAuhtStore.mockImplementation((selector: any) =>
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
    );

    TaskService.cleanupDeletedTasks.mockClear();
    TaskService.updateTask.mockResolvedValue({ result: 'OK', message: 'Updated' });
    TaskService.deleteTask.mockResolvedValue({ result: 'OK', message: 'Deleted' });
    TaskService.physicalDeleteTask.mockResolvedValue({ result: 'OK', message: 'Physically deleted' });
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

    fireEvent.click(screen.getAllByTestId('DateRangeOutlinedIcon')[0].closest('button')!);
    fireEvent.click(screen.getByTestId('priority-input'));

    const { TaskService } = require('../../../services/task.service');
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalled();
    });
  });

  it('abre el editor de prioridad desde la celda', () => {
    renderComponent();

    const gridProps = (globalThis as any).__tasksTableGridProps;
    expect(gridProps.rows.length).toBeGreaterThan(0);

    const priorityButton = screen.getAllByRole('button').find((button) =>
      button.querySelector('[data-testid="EmojiFlagsOutlinedIcon"]') !== null
    );
    expect(priorityButton).toBeTruthy();
    fireEvent.click(priorityButton as HTMLElement);

    expect(screen.getByTestId('priority-input')).toBeInTheDocument();
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

  it('cubre acciones de estado y borrado con confirmación', async () => {
    const { TaskService } = require('../../../services/task.service');
    TaskService.deleteTask.mockResolvedValueOnce({ result: 'ERROR', errorMessage: 'fallo borrado' });

    renderComponent();

    fireEvent.click(screen.getAllByTestId('action')[1]);
    fireEvent.click(screen.getAllByTestId('action')[2]);
    fireEvent.click(screen.getAllByTestId('action')[3]);
    fireEvent.click(screen.getAllByTestId('action')[4]);

    fireEvent.click(screen.getAllByTestId('action')[5]);
    const confirmationArg = mockSetConfirmation.mock.calls.at(-1)?.[0];
    confirmationArg.actions.props.onClick();

    await waitFor(() => {
      expect(TaskService.deleteTask).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  it('ejecuta rama de usuario no admin con workgroup y abre modal de nueva tarea', async () => {
    const { useAuhtStore } = require('../../../stores');
    const { useTasksStore } = require('../../../stores/tasks/tasks.store');

    useAuhtStore.mockImplementationOnce((selector: any) =>
      selector({ user: {
        id: 'u1',
        key: 'u1',
        name: 'Normal User',
        email: 'u1@test.com',
        role: 'USER',
        permissions: ['USER'],
        workgroupKeys: ['wg1'],
        active: true,
      } })
    );

    useTasksStore.mockImplementation((selector: any) => selector({ tasks: [
      {
        id: '10', key: '10', name: 'Activa', description: '', status: 'TODO', priority: 'LOW',
        createdDate: Date.now(), modifiedDate: Date.now(), workgroupKeys: ['wg1'], workgroupKey: 'wg1',
        ownerKeys: ['user1'], tags: ['t1'], dueDate: '', notes: '', history: [], createdByUserKey: 'user1', createdBy: 'user1'
      },
      {
        id: '11', key: '11', name: 'Archivada', description: '', status: 'ARCHIVED', priority: 'LOW',
        createdDate: Date.now(), modifiedDate: Date.now(), workgroupKeys: ['wg1'], workgroupKey: 'wg1',
        ownerKeys: ['user1'], tags: ['t2'], dueDate: '', notes: '', history: [], createdByUserKey: 'user1', createdBy: 'user1'
      }
    ] }));

    render(
      <Box sx={{ height: 400, width: '100%' }}>
        <TasksTableComponent workgroup={{ id: 'w1', key: 'wg1', name: 'WG 1', isActive: true } as any} />
      </Box>
    );

    fireEvent.click(screen.getByTestId('AddIcon').closest('button')!);
    expect(mockSetModal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Nueva Tarea' }));

    fireEvent.click(screen.getByTitle('Archivadas'));
    fireEvent.click(screen.getByTitle('Eliminadas'));
  });

  it('cubre ramas de error en ediciones de due date, prioridad y grupos', async () => {
    const { TaskService } = require('../../../services/task.service');
    TaskService.updateTask
      .mockResolvedValueOnce({ result: 'ERROR', errorMessage: 'bad due date' })
      .mockResolvedValueOnce({ result: 'ERROR', errorMessage: 'bad groups' });

    const { useWorkgroupStore } = require('../../../stores/workgroups/workgroups.store');
    useWorkgroupStore.mockImplementationOnce((selector: any) =>
      selector({ workgroups: [{ id: '1', key: 'wg1', name: 'Workgroup 1', isActive: true, color: '#00f' }] })
    );

    renderComponent();

    fireEvent.click(screen.getAllByTestId('DateRangeOutlinedIcon')[0].closest('button')!);
    fireEvent.click(screen.getAllByText('Guardar').at(-1)!);

    fireEvent.click(screen.getAllByTestId('GroupsOutlinedIcon')[0].closest('button')!);
    fireEvent.click(screen.getAllByText('Guardar').at(-1)!);

    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalledTimes(2);
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  it('cierra diálogo de historial con botón Cerrar', async () => {
    renderComponent();
    fireEvent.click(screen.getAllByTestId('HistoryOutlinedIcon')[0].closest('button')!);
    expect(screen.getByText('Historial de Tarea')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cerrar'));
    await waitFor(() => {
      expect(screen.queryByText('Historial de Tarea')).not.toBeInTheDocument();
    });
  });

  it('cubre edición de nombre, borrado de tag y acciones de estado de celdas', async () => {
    renderComponent();

    const nameInput = screen.getAllByRole('textbox').find((element) =>
      (element as HTMLInputElement).placeholder === 'Tarea 1'
    ) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Tarea 1 editada' } });
    fireEvent.click(screen.getAllByTitle('Guardar')[0]);

    const chipDeleteIcons = screen.queryAllByTestId('CancelIcon');
    if (chipDeleteIcons.length > 0) {
      fireEvent.click(chipDeleteIcons[0]);
    }

    const restartButtons = screen.getAllByTitle('Reiniciar');
    restartButtons.forEach((btn) => fireEvent.click(btn));

    const startButtons = screen.getAllByTitle('Iniciar');
    startButtons.forEach((btn) => fireEvent.click(btn));

    await waitFor(() => {
      const { TaskService } = require('../../../services/task.service');
      expect(TaskService.updateTask).toHaveBeenCalled();
    });
  });

  it('cubre onChange del date picker, prioridad, cierre del popover y ramas raras del historial', async () => {
    const { useTasksStore } = require('../../../stores/tasks/tasks.store');
    useTasksStore.mockImplementation((selector: any) => selector({ tasks: [
      {
        id: '99',
        key: '99',
        name: 'Tarea sin dueño',
        description: 'Descripción',
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        createdDate: Date.now(),
        modifiedDate: Date.now(),
        workgroupKeys: ['wg1'],
        workgroupKey: 'wg1',
        ownerKeys: [],
        tags: ['tagA'],
        dueDate: '',
        notes: 'nota',
        history: [
          {
            action: 'UPDATED',
            modifiedDate: Date.now(),
            modifierUserId: 'user1',
            changes: [
              { field: 'notes', oldValue: 'vieja', newValue: 'nueva' },
              { field: 'priority', oldValue: 'MEGA', newValue: 'XTRA' },
            ],
          },
        ],
        createdByUserKey: 'user1',
        createdBy: 'user1',
      }
    ] }));

    renderComponent();

    expect(screen.getByText('Tarea sin dueño')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Etiquetas'));
    const tagOption = await screen.findByText('tagA (1)');
    fireEvent.click(tagOption);

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' });

    const deleteChipButton = screen.queryByLabelText(/delete/i);
    if (deleteChipButton) {
      fireEvent.click(deleteChipButton);
    }

    fireEvent.click(screen.getAllByTestId('DateRangeOutlinedIcon')[0].closest('button')!);
    fireEvent.click(screen.getByTestId('mock-date-picker'));
    fireEvent.click(screen.getAllByText('Guardar').at(-1)!);

    fireEvent.click(screen.getAllByTestId('HistoryOutlinedIcon')[0].closest('button')!);
    expect(screen.getByText('Historial de Tarea')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      const { TaskService } = require('../../../services/task.service');
      expect(TaskService.updateTask).toHaveBeenCalled();
    });
  });

});
