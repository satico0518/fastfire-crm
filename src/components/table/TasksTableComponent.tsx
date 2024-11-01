import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import userNoImage from "../../assets/img/user-no-image.png";
import { Button, Chip, Input } from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Task } from "../../interfaces/Task";

import { useUiStore } from "../../stores/ui/ui.store";
import {
  GetUserNameByKey,
  translateStatus,
  translateTimestampToString,
} from "../../utils/utils";
import { useUsersStore } from "../../stores/users/users.store";
import { TaskService } from "../../services/task.service";
import { RefObject, useRef } from "react";
import { useAuhtStore } from "../../stores";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";

const paginationModel = { page: 0, pageSize: 15 };

export default function TasksTable() {
  const editNameRef = useRef<HTMLInputElement>(null);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const tasks = useTasksStore((state) => state.tasks);
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const currentUser = useAuhtStore(state => state.user)

  const handleEditTask = async (
    field: string,
    inputRef: RefObject<HTMLInputElement>,
    task: Task
  ) => {
    try {
      if (!!inputRef.current && !!inputRef.current.value) {
        task[field] = inputRef.current?.value ?? task[field];

        const resp = await TaskService.updateTask(task);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Tarea editada exitosamente.",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: "Error editando tarea.",
            severity: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error editando tarea", { task }, { error });
      setSnackbar({
        open: true,
        message: "Error editando tarea.",
        severity: "error",
      });
    }
  };

  const handleDeleteTag = async (task: Task, tag: string) => {
    try {
      task.tags = task.tags.filter((t) => t !== tag);
      TaskService.updateTask(task);
    } catch (error) {
      console.error("Error eliminando etiqueta", { task }, { error });
      setSnackbar({
        open: true,
        message: "Error eliminando etiqueta.",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nombre",
      type: "string",
      width: 150,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams<Task>) => (
        <>
          <Input inputRef={editNameRef} placeholder={params.row.name}></Input>
          <Button
            title="Guardar"
            onClick={() =>
              handleEditTask("name", editNameRef, params.row as Task)
            }
          >
            <SaveOutlinedIcon />
          </Button>
        </>
      ),
    },
    {
      field: "status",
      headerName: "Estado",
      type: "string",
      width: 180,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <>
          {params.row.status === "IN_PROGRESS" && (
            <Chip color="success" label={translateStatus(params.row.status)} />
          )}
          {params.row.status === "BLOCKED" && (
            <>
              <Chip color="error" label={translateStatus(params.row.status).replace('/.$/', 'a')} />
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
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <>
          <img className="user-image" src={row?.avatarURL ?? userNoImage} />{" "}
          <span
            style={{ cursor: "pointer" }}
            title={`Creada el ${translateTimestampToString(row.createdDate)}`}
          >
            {(users && GetUserNameByKey(row.createdByUserKey, users)) || "NA"}
          </span>
        </>
      ),
    },
    {
      field: "dueDate",
      headerName: "Fecha Limite",
      type: "string",
      width: 150,
      valueGetter: (value) => value ?? "Sin fecha límite",
    },
    {
      field: "workgroupKey",
      headerName: "Grupo de Trabajo",
      type: "string",
      width: 150,
      valueGetter: (value) => workgroups?.filter(wg => wg.key === value)[0].name,
    },
    {
      field: "ownerKey",
      headerName: "Responsable",
      sortable: false,
      width: 150,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <div className={`${!row.ownerKey && 'no-owner'}`}>
          {row.ownerKey && <img className="user-image" src={row?.avatarURL ?? userNoImage} />}
          {row.ownerKey ? <span>{' '}{(users && GetUserNameByKey(row.ownerKey, users)) || "NA"}</span> : "Sin asignar"}
        </div>
      ),
    },
    {
      field: "tags",
      headerName: "Etiquetas",
      type: "string",
      width: 400,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <div className="tags">
          {row.tags?.length && row.tags.map((tag: string) => (
            <Chip
              size="small"
              key={tag}
              label={tag}
              color="primary"
              onDelete={() => handleDeleteTag(row, tag)}
            />
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
            onClick={() =>
              TaskService.updateTask({ ...params.row, status: "BLOCKED" })
            }
            label="Bloquear"
            showInMenu
          />,
          <GridActionsCellItem
            onClick={() =>
              TaskService.updateTask({ ...params.row, status: "DONE" })
            }
            label="Finalizar"
            showInMenu
          />,
        <GridActionsCellItem
          onClick={() => handleDeleteConfirmation(params.row)}
          label="Archivar"
          showInMenu
        />,
      ],
    },
  ];

  const handleDeleteTask = async (task: Task) => {
    task.status = "DELETED";
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
      text: `Vas a archivar la tarea "${task.name.toUpperCase()}".`,
      actions: <Button onClick={() => handleDeleteTask(task)}>Archivar</Button>,
    });
  };

  const getTaskByRole = (): Task[] => {
    if (!currentUser?.permissions.includes('ADMIN'))
        return tasks?.filter(t => currentUser?.workgroupKeys.some(wg => t.workgroupKey === wg)) as Task[]
    
    return tasks !== null ? tasks : [];
  }

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "100%" }}>
      <DataGrid
        autoPageSize
        rows={getTaskByRole()}
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
