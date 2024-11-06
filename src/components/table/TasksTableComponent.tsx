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
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Task } from "../../interfaces/Task";

import { useUiStore } from "../../stores/ui/ui.store";
import {
  GetUserNameByKey,
  translatePriority,
  translateStatus,
  translateTimestampToString,
} from "../../utils/utils";
import { useUsersStore } from "../../stores/users/users.store";
import { TaskService } from "../../services/task.service";
import { RefObject, useRef } from "react";
import { useAuhtStore } from "../../stores";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { Workgroup } from "../../interfaces/Workgroup";
import { TaskCreatorRowComponent } from "../task-creator-row/TaskCreatorRowComponent";

const paginationModel = { page: 0, pageSize: 15 };

interface TasksTableProps {
  workgroup?: Workgroup;
}

export default function TasksTable({ workgroup }: TasksTableProps) {
  const editNameRef = useRef<HTMLInputElement>(null);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const tasks = useTasksStore((state) => state.tasks);
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const currentUser = useAuhtStore((state) => state.user);

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
              <Chip
                color="error"
                label={translateStatus(params.row.status).replace("/.$/", "a")}
              />
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
      field: "name",
      headerName: "Nombre",
      type: "string",
      width: 450,
      editable: true,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span
            style={{
              textDecoration: row.status === "DONE" ? "line-through" : "none",
            }}
          >
            {row.name}
          </span>
          <div className="tags">
            {row.tags?.length &&
              row.tags.map((tag: string) => (
                <Chip
                  size="small"
                  key={tag}
                  label={tag}
                  color="primary"
                  onDelete={() => handleDeleteTag(row, tag)}
                  sx={{fontSize: '12px'}}
                />
              ))}
          </div>
        </div>
      ),
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
      field: "ownerKey",
      headerName: "Responsable",
      sortable: false,
      width: 150,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <div className={`${!row.ownerKey && "no-owner"}`}>
          {row.ownerKey && (
            <img className="user-image" src={row?.avatarURL ?? userNoImage} />
          )}
          {row.ownerKey ? (
            <span>
              {" "}
              {(users && GetUserNameByKey(row.ownerKey, users)) || "NA"}
            </span>
          ) : (
            "Sin asignar"
          )}
        </div>
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
      field: "notes",
      headerName: "Notas",
      type: "string",
      width: 150,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "priority",
      headerName: "Prioridad",
      type: "string",
      width: 150,
      renderCell: (params: GridRenderCellParams<Task>) => params.row?.priority ? translatePriority(params.row.priority) : '-',
    },
    {
      field: "createdDate",
      headerName: "Fecha de Creación",
      type: "string",
      width: 180,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <span
          style={{ cursor: "pointer" }}
          title={`Creada por ${
            (users && GetUserNameByKey(row.createdByUserKey, users)) || "NA"
          }`}
        >
          {translateTimestampToString(row.createdDate)}
        </span>
      ),
    },
    {
      field: "workgroupKey",
      headerName: "Grupo de Trabajo",
      type: "string",
      width: 150,
      valueGetter: (value) =>
        workgroups?.filter((wg) => wg.key === value)[0]?.name || "Sin Nombre",
    },
    {
      field: "actions",
      type: "actions",
      width: 100,
      align: "right",
      getActions: (params: GridRowParams<Task>) => [
        <GridActionsCellItem
          icon={<BlockOutlinedIcon />}
          onClick={() =>
            TaskService.updateTask({ ...params.row, status: "BLOCKED" })
          }
          label="Bloquear"
          showInMenu
        />,
        <GridActionsCellItem
          hidden={params.row.status === "DONE"}
          icon={<TaskAltOutlinedIcon />}
          onClick={() =>
            TaskService.updateTask({ ...params.row, status: "DONE" })
          }
          label="Finalizar"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<ArchiveOutlinedIcon />}
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
    if (workgroup) {
      return tasks?.filter((t) => t.workgroupKey === workgroup.key) as Task[];
    }

    if (!currentUser?.permissions.includes("ADMIN"))
      return tasks
        ?.filter((t) =>
          currentUser?.workgroupKeys.some((wg) => t.workgroupKey === wg)
        )
        .filter((t) => t.status !== "DELETED") as Task[];

    return tasks !== null ? tasks.filter((t) => t.status !== "DELETED") : [];
  };

  return (
    <Paper sx={{ height: "calc(100vh - 220px)", width: "100%" }}>
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
      <TaskCreatorRowComponent />
    </Paper>
  );
}
