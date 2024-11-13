import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumnResizeParams,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button, Chip, FormControlLabel, Input, Switch, Tooltip } from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Task } from "../../interfaces/Task";

import { useUiStore } from "../../stores/ui/ui.store";
import {
  getUserKeysByNames,
  getUserNameByKey,
  translatePriority,
  translateStatus,
  translateTimestampToString,
} from "../../utils/utils";
import { useUsersStore } from "../../stores/users/users.store";
import { TaskService } from "../../services/task.service";
import { RefObject, useRef, useState } from "react";
import { useAuhtStore } from "../../stores";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { Workgroup } from "../../interfaces/Workgroup";
import { TaskCreatorRowComponent } from "../task-creator-row/TaskCreatorRowComponent";
import { DialogueMultiselect } from "../dialogs/DialogueMultiselect";
import { User } from "../../interfaces/User";
import { useTagsStore } from "../../stores/tags/tags.store";

const paginationModel = { page: 0, pageSize: 15 };

interface TasksTableProps {
  workgroup?: Workgroup;
}

interface ColumnWidhts {
  status: number;
  name: number;
  ownerKeys: number;
  dueDate: number;
  notes: number;
  priority: number;
  createdDate: number;
  workgroupKeys: number;
}

export default function TasksTable({ workgroup }: TasksTableProps) {
  const editNameRef = useRef<HTMLInputElement>(null);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const tags = useTagsStore((state) => state.tags);
  const tasks = useTasksStore((state) => state.tasks);
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const currentUser = useAuhtStore((state) => state.user);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [openOwnersDialog, setOpenOwnersDialog] = useState<boolean>(false);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [openTagsDialog, setOpenTagsDialog] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [columWidths, setColumWidths] = useState<ColumnWidhts | null>(JSON.parse(sessionStorage.getItem("columWidths") || "{}"));

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

  const handleEditOwner = async () => {
    try {
      if (selectedTask) {
        selectedTask.ownerKeys =
          getUserKeysByNames(selectedOwners, users as User[]) ?? [];
        const resp = await TaskService.updateTask(selectedTask);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Tarea editada exitosamente!",
            severity: "success",
          });
          setSelectedOwners([]);
        } else {
          console.error(
            "Error editando tarea en Task Creator, ",
            resp.errorMessage
          );
          setSnackbar({
            open: true,
            message: "Error editando tarea.",
            severity: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error creando tarea en Task Creator, ", { error });
      setSnackbar({
        open: true,
        message: "Error creando tarea.",
        severity: "error",
      });
    }
  };

  const handleAddTags = async () => {
    try {
      if (selectedTask) {
        selectedTask.tags = selectedTags;
        TaskService.updateTask(selectedTask);
        setSelectedTags([]);
      }
    } catch (error) {
      console.error("Error eliminando etiqueta", { selectedTask }, { error });
      setSnackbar({
        open: true,
        message: "Error eliminando etiqueta.",
        severity: "error",
      });
    }
  };

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
      text: `Vas a eliminar la tarea "${task.name.toUpperCase()}", no podras volver a verla ni revisar su historial.`,
      actions: <Button onClick={() => handleDeleteTask(task)}>Eliminar</Button>,
    });
  };

  const getTaskByRole = (): Task[] => {
    if (workgroup) {
      return tasks
        ?.filter((t) => t.workgroupKeys?.some((k) => workgroup.key === k))
        .filter(
          (t) =>
            t.status !== "DELETED" &&
            (showArchivedTasks || t.status !== "ARCHIVED")
        ) as Task[];
    }

    if (!currentUser?.permissions.includes("ADMIN"))
      return tasks
        ?.filter((t) =>
          currentUser?.workgroupKeys.some((k) => t.workgroupKey === k)
        )
        .filter(
          (t) =>
            t.status !== "DELETED" &&
            (showArchivedTasks || t.status !== "ARCHIVED")
        ) as Task[];

    return tasks !== null
      ? tasks?.filter(
          (t) =>
            t.status !== "DELETED" &&
            (showArchivedTasks || t.status !== "ARCHIVED")
        )
      : [];
  };

  const columns: GridColDef[] = [
    // actions
    {
      field: "actions",
      type: "actions",
      width: 50,
      resizable: false,
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
          onClick={() =>
            TaskService.updateTask({ ...params.row, status: "ARCHIVED" })
          }
          label="Archivar"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<ArchiveOutlinedIcon />}
          onClick={() => handleDeleteConfirmation(params.row)}
          label="Eliminar"
          showInMenu
        />,
      ],
    },
    // status
    {
      field: "status",
      headerName: "Estado",
      type: "string",
      width: columWidths?.status ?? 180,
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
          )}{" "}
          {params.row.status === "DELETED" && (
            <Chip color="error" label={translateStatus(params.row.status)} />
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
    // name
    {
      field: "name",
      headerName: "Nombre",
      type: "string",
      width: columWidths?.name ?? 380,
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
                  sx={{ fontSize: "12px" }}
                />
              ))}
            <Button
              size="small"
              color="secondary"
              sx={{ fontSize: "12px" }}
              onClick={() => {
                setSelectedTask(row);
                setSelectedTags(row.tags || []);
                setOpenTagsDialog(true);
              }}
              title="Agregar etiqueta"
            >
              <AddCircleOutlinedIcon />
            </Button>
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
    // owners
    {
      field: "ownerKeys",
      headerName: "Responsables",
      sortable: false,
      width: columWidths?.ownerKeys ?? 150,
      align: "center",
      editable: true,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <div className={`${!row.ownerKeys && "no-owner"} owners-container`}>
          {row.ownerKeys
            ? row.ownerKeys.map((k) => (
                <div
                  key={k}
                  className="owner-circle"
                  title={(users && getUserNameByKey(k, users)) || "NA"}
                  style={{
                    backgroundColor:
                      users?.filter((u) => u.key === k)[0]?.color ??
                      "blueviolet",
                  }}
                >
                  {`${users
                    ?.filter((u) => u.key === k)[0]
                    ?.firstName.charAt(0)}${users
                    ?.filter((u) => u.key === k)[0]
                    ?.lastName.charAt(0)}`}
                </div>
              ))
            : "Sin asignar"}
        </div>
      ),
      renderEditCell: ({ row }: GridRenderEditCellParams<Task>) => (
        <>
          <Button
            onClick={() => {
              setSelectedTask(row);
              setSelectedOwners(
                (row?.ownerKeys?.map((k) =>
                  getUserNameByKey(k, users as User[])
                ) as string[]) || []
              );
              setOpenOwnersDialog(true);
            }}
          >
            <GroupAddOutlinedIcon />
          </Button>
        </>
      ),
    },
    // dueDate
    {
      field: "dueDate",
      headerName: "Fecha Limite",
      type: "string",
      width: columWidths?.dueDate ?? 150,
      valueGetter: (value) => value ?? "Sin fecha límite",
    },
    // notes
    {
      field: "notes",
      headerName: "Notas",
      type: "string",
      width: columWidths?.notes ?? 150,
      renderCell: ({row}: GridRenderCellParams<Task>) => 
        (row.notes?.length > 0 ? <Tooltip title={row.notes} sx={{cursor: 'context-menu'}}><SpeakerNotesOutlinedIcon /></Tooltip> : "-"),
    },
    // priority
    {
      field: "priority",
      headerName: "Prioridad",
      type: "string",
      width: columWidths?.priority ?? 150,
      renderCell: (params: GridRenderCellParams<Task>) =>
        params.row?.priority ? translatePriority(params.row.priority) : "-",
    },
    // createdDate
    {
      field: "createdDate",
      headerName: "Fecha de Creación",
      type: "string",
      width: columWidths?.createdDate ?? 180,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <span
          style={{ cursor: "pointer" }}
          title={`Creada por ${
            (users && getUserNameByKey(row.createdByUserKey, users)) || "NA"
          }`}
        >
          {translateTimestampToString(row.createdDate)}
        </span>
      ),
    },
    // workgroupKeys
    {
      field: "workgroupKeys",
      headerName: "Grupos de Trabajo",
      type: "string",
      width: columWidths?.workgroupKeys ?? 250,
      renderCell: ({ row }: GridRenderCellParams<Task>) => {
        const taskWorkgroups = workgroups?.filter((wg) =>
          row.workgroupKeys?.some((k) => k === (wg.key as string))
        );
        return taskWorkgroups?.map((wg) => (
          <Chip style={{ marginLeft: "5px" }} size="small" label={wg.name} />
        ));
      },
    },
  ];

  return (
    <Paper sx={{ height: "calc(100vh - 220px)", width: "100%" }}>
      <DataGrid
        autoPageSize
        rows={getTaskByRole()}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[20]}
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por pagina" },
        }}
        sx={{ border: 0 }}
        rowHeight={35}
        onColumnWidthChange={({ colDef, width }: GridColumnResizeParams) => {
          const widths = { ...columWidths, [colDef.field]: width };
          setColumWidths(widths as ColumnWidhts);
          sessionStorage.setItem("columWidths", JSON.stringify(widths));
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <TaskCreatorRowComponent />
        <FormControlLabel
          sx={{ color: "white" }}
          control={
            <Switch
              color={showArchivedTasks ? "info" : "default"}
              title="ver archivadas"
              checked={showArchivedTasks}
              onChange={() => setShowArchivedTasks(!showArchivedTasks)}
            />
          }
          label="ver archivadas"
          labelPlacement="start"
        />
      </div>

      <DialogueMultiselect
        title="Etiquetas"
        open={openTagsDialog}
        labels={Object.values(tags) as unknown as string[]}
        setOpen={setOpenTagsDialog}
        value={selectedTags}
        setValue={setSelectedTags}
        okButtonText="Guardar"
        okButtonAction={() => handleAddTags()}
      />
      <DialogueMultiselect
        title="Responsables"
        open={openOwnersDialog}
        labels={
          users?.map((u) =>
            getUserNameByKey(u.key as string, users)
          ) as unknown as string[]
        }
        setOpen={setOpenOwnersDialog}
        value={selectedOwners}
        setValue={setSelectedOwners}
        okButtonText="Guardar"
        okButtonAction={() => handleEditOwner()}
      />
    </Paper>
  );
}
