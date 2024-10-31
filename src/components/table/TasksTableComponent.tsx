import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import userNoImage from "../../assets/img/user-no-image.png";
import { Button, Chip } from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Task } from "../../interfaces/Task";

import { useUiStore } from "../../stores/ui/ui.store";
import { GetProjectNameByKey, GetUserNameByKey, translateStatus, translateTimestampToString } from "../../utils/utils";
import { useUsersStore } from "../../stores/users/users.store";
import { useProjectsStore } from "../../stores/projects/projects.store";
import { TaskService } from "../../services/task.service";
import { TasksFormComponent } from "../tasks-form/TasksFormComponent";

const paginationModel = { page: 0, pageSize: 15 };

export default function TasksTable() {
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const tasks = useTasksStore(state => state.tasks);
  const users = useUsersStore(state => state.users);
  const projects = useProjectsStore(state => state.projects);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nombre",
      type: "string",
      width: 150,
    },
    {
      field: "status",
      headerName: "Estado",
      type: "string",
      width: 150,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <>
          {params.row.status === "IN_PROGRESS" && (
            <Chip color="success" label={translateStatus(params.row.status)} />
          )}
          {params.row.status === "BLOCKED" && (
            <>
              <Chip color="error" label={translateStatus(params.row.status)} />
              <Button
                title="Iniciar"
                onClick={() =>
                  TaskService.updateTask({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
              >
                <PlayCircleFilledOutlinedIcon />
              </Button>
            </>
          )}
          {params.row.status === "ARCHIVED" && (
            <Chip color="default" label={translateStatus(params.row.status)} />
          )}
          {params.row.status === "DONE" && (
            <>
              <Chip color="info" label={translateStatus(params.row.status)} />
              <Button
                title="Reiniciar"
                onClick={() =>
                  TaskService.updateTask({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
              >
                <PlayCircleFilledOutlinedIcon />
              </Button>
            </>
          )}
          {params.row.status === "TODO" && (
            <>
              <span>{translateStatus(params.row.status)}</span>
              <Button
                title="Iniciar"
                onClick={() =>
                  TaskService.updateTask({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
              >
                <PlayCircleFilledOutlinedIcon />
              </Button>
            </>
          )}
        </>
      ),
    },
    {
      field: "createdById",
      headerName: "Creada Por",
      type: "string",
      width: 250,
      renderCell: ({row}: GridRenderCellParams<Task>) => (
        <>
          <img
            className="user-image"
            src={row?.avatarURL ?? userNoImage}
          />{" "}
          <span>{(users && GetUserNameByKey(row.createdByUserKey, users)) || 'NA'}</span>
        </>
      ),
    },
    {
      field: "createdDate",
      headerName: "Fecha Creada",
      type: "string",
      width: 150,
      valueGetter: translateTimestampToString
    },
    {
      field: "dueDate",
      headerName: "Fecha Limite",
      type: "string",
      width: 150,
      valueGetter: value => value ?? 'Sin fecha límite'
    },
    {
      field: "ownerId",
      headerName: "Responsable",
      sortable: false,
      width: 150,
      renderCell: ({row}: GridRenderCellParams<Task>) => (
        <>
          <img
            className="user-image"
            src={row?.avatarURL ?? userNoImage}
          />{" "}
          <span>{(users && GetUserNameByKey(row.ownerId, users)) || 'NA'}</span>
        </>
      ),
    },
    {
      field: "projectId",
      headerName: "Proyecto",
      type: "string",
      width: 150,
      valueGetter: value => projects && GetProjectNameByKey(value, projects) || 'NA'
    },
    {
      field: "tags",
      headerName: "Etiquetas",
      type: "string",
      width: 400,
      renderCell: ({row}: GridRenderCellParams) => (
        <div className="permissions">
          {row.tags.map((tag: string) => (
            <Chip size="small" key={tag} label={tag} color="primary" />
          ))}
        </div>
      ),
    },
    {
      field: "actions",
      type: "actions",
      width: 100,
      align: "right",
      getActions: (params: GridRowParams<Task>) => [
        <GridActionsCellItem
            onClick={() => setModal({
              ...modal,
              open: true,
              title: "Modificar Tarea",
              text: "Ingrese los datos a modificar.",
              content: <TasksFormComponent editingTask={params.row}/>,
            })}
            label="Modificar"
            showInMenu
          />,
        <GridActionsCellItem
          onClick={() => handleDeleteConfirmation(params.row)}
          label="Eliminar"
          showInMenu
        />,
      ],
    },
  ];

  const handleDeleteTask = async (task: Task) => {
    task.status = 'DELETED';
    const deleteResult = await TaskService.updateTask(task);

    if (deleteResult)
      setSnackbar({
        open: true,
        message: "Tarea eliminada exitosamente!",
        severity: "success",
      });
    else
      setSnackbar({
        open: true,
        message: "Error al eliminar tarea.",
        severity: "error",
      });

    setConfirmation({ open: false, title: "", text: "", actions: null });
  };

  const handleDeleteConfirmation = (task: Task) => {
    setConfirmation({
      open: true,
      title: "Confirmacion!",
      text: `Vas a eliminar la tarea "${task.name.toUpperCase()}".`,
      actions: (
        <Button onClick={() => handleDeleteTask(task)}>Eliminar</Button>
      ),
    });
  };

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "100%" }}>
      <DataGrid
        autoPageSize
        rows={tasks as Task[]}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[15, 30]}
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por pagina" },
        }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
