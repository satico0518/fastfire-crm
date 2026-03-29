import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumnResizeParams,
  GridFilterModel,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Input,
  List,
  ListItem,
  ListItemText,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  Box,
} from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SpeakerNotesOutlinedIcon from "@mui/icons-material/SpeakerNotesOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import EmojiFlagsOutlinedIcon from "@mui/icons-material/EmojiFlagsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Priority, Task } from "../../interfaces/Task";

import { useUiStore } from "../../stores/ui/ui.store";
import {
  changeDateFromDMA_MDA,
  downloadExcelFile,
  getUserKeysByNames,
  getUserNameByKey,
  getWorkgroupNameByKey,
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
import { TasksFormComponent } from "../tasks-form/TasksFormComponent";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { DialogueMultiselect } from "../dialogs/DialogueMultiselect";
import { User } from "../../interfaces/User";
import { PriorityInput } from "../priority-input/PriorityInput";
import { DialogueCustomContent } from "../dialogs/DialogueCustomContent";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { TagsInput } from "../tags-input/TagsInput";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import CheckIcon from "@mui/icons-material/Check";

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
  const isMobile = useMediaQuery('(max-width: 1100px)');
  const editNameRef = useRef<HTMLInputElement>(null);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const setModal = useUiStore((state) => state.setModal);
  const tasks = useTasksStore((state) => state.tasks);
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const currentUser = useAuhtStore((state) => state.user);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [tagAnchorEl, setTagAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [openOwnersDialog, setOpenOwnersDialog] = useState<boolean>(false);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  const [openTagsDialog, setOpenTagsDialog] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [openGroupsDialog, setOpenGroupsDialog] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [openPriorityDialog, setOpenPriorityDialog] = useState(false);
  const [priority, setPriority] = useState<Priority | null>();

  const [openDueDateDialog, setOpenDueDateDialog] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<Dayjs | null>();

  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [taskNotes, setTaskNotes] = useState<string | null>();

  const [columWidths, setColumWidths] = useState<ColumnWidhts | null>(
    JSON.parse(sessionStorage.getItem("columWidths") || "{}")
  );

  const translateHistoryAction = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'CREADA';
      case 'UPDATED':
        return 'ACTUALIZADA';
      case 'NOTE_ADDED':
        return 'NOTA AÑADIDA';
      case 'DELETED':
        return 'ELIMINADA';
      default:
        return action;
    }
  };

  const translateHistoryField = (field: string) => {
    switch (field) {
      case 'ownerKeys':
        return 'Responsables';
      case 'notes':
        return 'Notas';
      case 'dueDate':
        return 'Fecha límite';
      case 'priority':
        return 'Prioridad';
      case 'status':
        return 'Estado';
      case 'workgroupKeys':
        return 'Grupos';
      case 'tags':
        return 'Etiquetas';
      case 'name':
        return 'Nombre';
      default:
        return field;
    }
  };

  const translateHistoryValue = (field: string, value: unknown) => {
    if (value === undefined || value === null) return 'N/A';

    if (field === 'priority' && typeof value === 'string') {
      switch (value) {
        case 'LOW':
          return 'Baja';
        case 'NORMAL':
          return 'Normal';
        case 'HIGH':
          return 'Alta';
        case 'URGENT':
          return 'Urgente';
        default:
          return value;
      }
    }

    if (field === 'status' && typeof value === 'string') {
      return translateStatus(value as any);
    }

    if (field === 'dueDate' && typeof value === 'string') {
      const parsed = dayjs(value, ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']);
      return parsed.isValid() ? parsed.format('DD/MM/YYYY') : value;
    }

    if (field === 'ownerKeys' && Array.isArray(value)) {
      return value
        .map((key) => getUserNameByKey(String(key), users || []))
        .join(', ');
    }

    if (field === 'workgroupKeys' && Array.isArray(value)) {
      return value
        .map((key) => getWorkgroupNameByKey(String(key), workgroups || []))
        .join(', ');
    }

    if (field === 'tags' && Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value);
  };

  const updateTaskByUser = async (task: Task) => TaskService.updateTask(task, currentUser?.key);

  const handleEditTask = async (
    field: string,
    inputRef: RefObject<HTMLInputElement>,
    task: Task
  ) => {
    try {
      if (!!inputRef.current && !!inputRef.current.value) {
        task[field] = inputRef.current?.value ?? task[field];

        const resp = await updateTaskByUser(task);
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
      updateTaskByUser(task);
      setSelectedTags(selectedTags.filter((t) => t !== tag));
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
        const resp = await updateTaskByUser(selectedTask);
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

  const handleEditPriority = async () => {
    try {
      if (selectedTask) {
        selectedTask.priority = priority as Priority;
        const resp = await updateTaskByUser(selectedTask);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Tarea editada exitosamente!",
            severity: "success",
          });
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

  const handleEditDueDate = async () => {
    try {
      if (selectedTask) {
        selectedTask.dueDate = selectedDueDate
          ? (selectedDueDate?.format("DD/MM/YYYY") as string)
          : "";

        const resp = await updateTaskByUser(selectedTask);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Tarea editada exitosamente!",
            severity: "success",
          });
        } else {
          console.error(
            "Error editando tarea en table Task, ",
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
      console.error("Error editando etiqueta", { selectedTask }, { error });
      setSnackbar({
        open: true,
        message: "Error editando etiqueta.",
        severity: "error",
      });
    }
  };

  const handleEditNotes = async () => {
    try {
      if (selectedTask) {
        selectedTask.notes = `${
          selectedTask.notes && selectedTask.notes.length > 0
            ? `${selectedTask.notes}, `
            : ""
        }[${dayjs(Date.now()).format("DDMMMYY hh:mm")}] ${taskNotes}`;
        const resp = await updateTaskByUser(selectedTask);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Tarea editada exitosamente!",
            severity: "success",
          });
        } else {
          console.error(
            "Error editando tarea en Table Task, ",
            resp.errorMessage
          );
          setSnackbar({
            open: true,
            message: "Error editando tarea.",
            severity: "error",
          });
        }
        setTaskNotes("");
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

  const handleEditGroups = async () => {
    try {
      if (selectedTask) {
        selectedTask.workgroupKeys =
          (workgroups
            ?.filter((wg) => selectedGroups.some((sg) => sg === wg.name))
            .map((wg) => wg.key) as string[]) || [];

        const resp = await updateTaskByUser(selectedTask);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Tarea editada exitosamente!",
            severity: "success",
          });
        } else {
          console.error(
            "Error editando tarea en Table Task, ",
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

  const handleDeleteTask = async (task: Task) => {
    const deleteResult = await TaskService.deleteTask(task);

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
      title: "Confirmación!",
      text: `Vas a eliminar la tarea "${task.name.toUpperCase()}", no podrás volver a verla ni revisar su historial.`,
      actions: <Button onClick={() => handleDeleteTask(task)}>Eliminar</Button>,
    });
  };

  const handleExport = () => {
    const tasksToExport = getTaskByRole();
    const data = tasksToExport.map(task => ({
      Estado: translateStatus(task.status),
      Nombre: task.name,
      Responsables: task.ownerKeys?.map(k => getUserNameByKey(k, users || [])).join(', ') || 'Sin asignar',
      'Fecha Límite': task.dueDate ? dayjs(task.dueDate, 'DD/MM/YYYY').format('DD/MM/YYYY') : 'Sin fecha límite',
      Notas: task.notes || '',
      Prioridad: task.priority ? ['Baja', 'Normal', 'Alta', 'Urgente'][['LOW','NORMAL','HIGH','URGENT'].indexOf(task.priority)] : '-',
      'Fecha de Creación': translateTimestampToString(task.createdDate),
      'Grupos de Trabajo': task.workgroupKeys?.map(k => getWorkgroupNameByKey(k, workgroups || [])).join(', ') || '',
      'Creado por': getUserNameByKey(task.createdByUserKey, users || []) || 'NA',
    }));
    downloadExcelFile(data, `tareas_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const getFilteredByTags = (taskList: Task[]): Task[] => {
    if (activeTagFilters.length === 0) return taskList;
    return taskList.filter((t) =>
      activeTagFilters.some((tag) => t.tags?.includes(tag))
    );
  };

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getTaskByRole = (): Task[] => {
    if (workgroup) {
      return tasks
        ?.filter((t) => t.workgroupKeys?.some((k) => workgroup.key === k))
        .filter(
          (t) =>
            t.status !== "DELETED" &&
            (showArchivedTasks ? t.status === "ARCHIVED" : t.status !== "ARCHIVED")
        ) as Task[];
    }

    if (!currentUser?.permissions.includes("ADMIN"))
      return getFilteredByTags(
        tasks
          ?.filter((t) =>
            currentUser?.workgroupKeys.some((k) => t.workgroupKey === k)
          )
          .filter(
            (t) =>
              t.status !== "DELETED" &&
              (showArchivedTasks ? t.status === "ARCHIVED" : t.status !== "ARCHIVED")
          ) as Task[]
      );

    return getFilteredByTags(
      tasks !== null
        ? tasks?.filter(
            (t) =>
              t.status !== "DELETED" &&
              (showArchivedTasks ? t.status === "ARCHIVED" : t.status !== "ARCHIVED")
          )
        : []
    );
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
          icon={<HistoryOutlinedIcon color="inherit" />}
          onClick={() => {
            setHistoryTask(params.row);
            setOpenHistoryDialog(true);
          }}
          label="Historial"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<RestoreOutlinedIcon color="info" />}
          onClick={() =>
            updateTaskByUser({ ...params.row, status: "TODO" })
          }
          label="Volver a Iniciar"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<BlockOutlinedIcon color="warning" />}
          onClick={() =>
            updateTaskByUser({ ...params.row, status: "BLOCKED" })
          }
          label="Bloquear"
          showInMenu
        />,
        <GridActionsCellItem
          hidden={params.row.status === "DONE"}
          icon={<TaskAltOutlinedIcon color="success" />}
          onClick={() =>
            updateTaskByUser({ ...params.row, status: "DONE" })
          }
          label="Finalizar"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<ArchiveOutlinedIcon />}
          onClick={() =>
            updateTaskByUser({ ...params.row, status: "ARCHIVED" })
          }
          label="Archivar"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon color="error" />}
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
      filterable: true,
      valueGetter: (_value: any, row: Task) => {
        // Para el filtro, devolvemos el estado traducido
        return translateStatus(row.status);
      },
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
                  updateTaskByUser({
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
                  updateTaskByUser({
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
                  updateTaskByUser({
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
              Array.from(new Set(row.tags)).map((tag: string, idx: number) => (
                <Chip
                  size="small"
                  key={`${tag}-${idx}`}
                  label={tag}
                  color="primary"
                  onDelete={() => handleDeleteTag(row, tag)}
                  sx={{ fontSize: "12px" }}
                />
              ))}
            <Button
              size="small"
              color="secondary"
              sx={{ fontSize: "12px", width: "30px" }}
              onClick={() => {
                setSelectedTask(row);
                setSelectedTags(Array.from(new Set(row.tags || [])));
                setOpenTagsDialog(true);
              }}
              title="Etiquetas"
            >
              <LocalOfferOutlinedIcon fontSize={"small"} />
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
      filterable: true,
      width: columWidths?.ownerKeys ?? 150,
      align: "center",
      editable: true,
      valueGetter: (_value: any, row: Task) => {
        // Para el filtro, devolvemos los nombres en lugar de los IDs
        if (!Array.isArray(row?.ownerKeys) || row.ownerKeys.length === 0) {
          return "Sin asignar";
        }
        return row.ownerKeys
          .map((ownerKey: string) => getUserNameByKey(ownerKey, users || []))
          .filter(Boolean)
          .join(", ");
      },
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <div className={`${!row.ownerKeys && "no-owner"} owners-container`}>
          {Array.isArray(row.ownerKeys) && row.ownerKeys.length > 0
            ? row.ownerKeys.map((k) => {
                const userAvatar = users?.find((u) => u.key === k)?.avatarURL;

                if (userAvatar)
                  return (
                    <Avatar
                      key={k}
                      title={(users && getUserNameByKey(k, users)) || "NA"}
                      src={userAvatar}
                      sx={{ 
                        width: "36px", 
                        height: "36px", 
                        marginLeft: "-10px",
                        p: "1px",
                        border: "1.5px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        bgcolor: "white",
                        cursor: 'zoom-in',
                        transform: "translateZ(0)",
                        transition: "transform 0.15s ease",
                        "&:hover": { transform: "scale(1.2) translateZ(0)", zIndex: 10 }
                      }}
                      imgProps={{ style: { objectFit: 'contain' } }}
                    />
                  );

                return (
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
                );
              })
            : "Sin asignar"}
        </div>
      ),
      renderEditCell: ({ row }: GridRenderEditCellParams<Task>) => (
        <Button
          onClick={() => {
            setSelectedTask(row);
            setSelectedOwners(
              (Array.isArray(row?.ownerKeys) 
                ? row.ownerKeys.map((k) =>
                    getUserNameByKey(k, users as User[])
                  ) 
                : []) || []
            );
            setOpenOwnersDialog(true);
          }}
        >
          <GroupAddOutlinedIcon />
        </Button>
      ),
    },
    // dueDate
    {
      field: "dueDate",
      headerName: "Fecha Limite",
      type: "string",
      width: columWidths?.dueDate ?? 120,
      renderCell: ({ row }: GridRenderCellParams<Task>) =>
        row?.dueDate
          ? dayjs(changeDateFromDMA_MDA(row.dueDate as string)).format(
              "DD/MM/YYYY"
            )
          : "Sin fecha límite",
      editable: true,
      renderEditCell: ({ row }: GridRenderEditCellParams<Task>) => (
        <Button
          onClick={() => {
            setSelectedTask(row);
            if (row?.dueDate)
              setSelectedDueDate(
                dayjs(changeDateFromDMA_MDA(row.dueDate as string))
              );
            setOpenDueDateDialog(true);
          }}
        >
          <DateRangeOutlinedIcon />
        </Button>
      ),
    },
    // notes
    {
      field: "notes",
      headerName: "Notas",
      type: "string",
      sortable: false,
      disableColumnMenu: true,
      width: columWidths?.notes ?? 60,
      align: "center",
      renderCell: ({ row }: GridRenderCellParams<Task>) =>
        row.notes?.length > 0 ? (
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Tooltip title={row.notes} sx={{ cursor: "context-menu" }}>
              <SpeakerNotesOutlinedIcon />
            </Tooltip>
          </div>
        ) : (
          "-"
        ),
      editable: true,
      renderEditCell: ({ row }: GridRenderEditCellParams<Task>) => (
        <Button
          onClick={() => {
            setSelectedTask(row);
            setOpenNotesDialog(true);
          }}
        >
          <NoteAltOutlinedIcon />
        </Button>
      ),
    },
    // priority
    {
      field: "priority",
      headerName: "Prioridad",
      type: "string",
      width: columWidths?.priority ?? 150,
      renderCell: (params: GridRenderCellParams<Task>) =>
        params.row?.priority ? translatePriority(params.row.priority) : "-",
      editable: true,
      renderEditCell: ({ row }: GridRenderEditCellParams<Task>) => (
        <Button
          onClick={() => {
            setSelectedTask(row);
            setPriority(row?.priority);
            setOpenPriorityDialog(true);
          }}
        >
          <EmojiFlagsOutlinedIcon />
        </Button>
      ),
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
          <Chip 
            key={wg.key} 
            style={{ marginLeft: "5px" }} 
            size="small" 
            label={wg.name} 
          />
        ));
      },
      editable: true,
      renderEditCell: ({ row }: GridRenderEditCellParams<Task>) => (
        <>
          <Button
            onClick={() => {
              setSelectedTask(row);
              setSelectedGroups(
                (row?.workgroupKeys?.map((k) =>
                  getWorkgroupNameByKey(k, workgroups as Workgroup[])
                ) as string[]) || []
              );
              setOpenGroupsDialog(true);
            }}
          >
            <GroupsOutlinedIcon />
          </Button>
        </>
      ),
    },    // creado por
    {
      field: "createdByUserKey",
      headerName: "Creado por",
      type: "string",
      width: 180,
      renderCell: ({ row }: GridRenderCellParams<Task>) => (
        <Tooltip title={`Usuario: ${(users && getUserNameByKey(row.createdByUserKey, users)) || "NA"}`}>
          <span>{(users && getUserNameByKey(row.createdByUserKey, users)) || "NA"}</span>
        </Tooltip>
      ),
      sortable: false,
      filterable: true,
      valueGetter: (_value: any, row: Task) =>
        (users && getUserNameByKey(row.createdByUserKey, users)) || "NA",
    },  ];

  return (
    <>
      <Paper 
        sx={{ 
          height: isMobile ? "calc(100vh - 185px)" : "calc(100vh - 245px)", 
          width: "100%",
          backgroundColor: 'rgba(28, 28, 30, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '& .MuiDataGrid-root': {
            border: 0,
            color: 'white',
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              fontWeight: 800,
              textTransform: 'uppercase',
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiTablePagination-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            }
          }
        }}
      >
      <DataGrid
        autoPageSize
        columnHeaderHeight={36}
        rows={getTaskByRole()}
        columns={isMobile 
          ? columns.filter(col => ['actions', 'status', 'name', 'ownerKeys', 'dueDate'].includes(col.field))
          : columns
        }
        filterModel={filterModel}
        onFilterModelChange={(newModel) => setFilterModel(newModel)}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[20]}
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por pagina" },
        }}
        slotProps={{
          filterPanel: {
            sx: {
              maxWidth: '95vw',
              '& .MuiDataGrid-filterForm': {
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '10px',
                padding: '8px',
              },
              '& .MuiDataGrid-filterFormColumnInput': { width: '100%', m: 0 },
              '& .MuiDataGrid-filterFormOperatorInput': { width: '100%', m: 0 },
              '& .MuiDataGrid-filterFormValueInput': { width: '100%', m: 0 },
            },
          },
        }}
        sx={{
          border: 0,
          fontSize: "0.75rem",
          "& .MuiDataGrid-cell": {
            paddingTop: "4px",
            paddingBottom: "4px",
            lineHeight: 1.2,
          },
          "& .MuiDataGrid-columnHeader": {
            fontSize: "0.75rem",
            minHeight: "30px",
            lineHeight: 1.2,
          },
          "& .MuiDataGrid-row": {
            maxHeight: "28px",
            minHeight: "28px",
          },
          "& .MuiDataGrid-virtualScrollerContent": {
            "& .MuiDataGrid-row": {
              minHeight: "28px !important",
              maxHeight: "28px !important",
            },
          },
          "& .MuiChip-root": {
            fontSize: "0.65rem",
            height: "22px",
            lineHeight: 1,
            minHeight: "22px",
            padding: "0 6px",
          },
          "& .MuiSvgIcon-root": {
            fontSize: "1rem",
          },
          "@media (max-width: 1100px)": {
            fontSize: "0.68rem",
            "& .MuiChip-root": {
              fontSize: "0.6rem",
              height: "20px",
              minHeight: "20px",
              padding: "0 5px",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "0.9rem",
            },
            "& .MuiDataGrid-cell": {
              paddingTop: "2px",
              paddingBottom: "2px",
            },
            "& .MuiDataGrid-columnHeader": {
              fontSize: "0.68rem",
              minHeight: "28px",
            },
            "& .MuiDataGrid-row": {
              minHeight: "24px",
              maxHeight: "24px",
            },
            "& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row": {
              minHeight: "24px !important",
              maxHeight: "24px !important",
            },
          },
        }}
        rowHeight={28}
        onColumnWidthChange={({ colDef, width }: GridColumnResizeParams) => {
          const widths = { ...columWidths, [colDef.field]: width };
          setColumWidths(widths as ColumnWidhts);
          sessionStorage.setItem("columWidths", JSON.stringify(widths));
        }}
      />
      </Paper>
      {/* Row 1: Nueva Tarea | Archivadas + Excel */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <TaskCreatorRowComponent />
        </Box>
        
        {/* Mobile ONLY creator button */}
        <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setModal({
              open: true,
              title: "Nueva Tarea",
              content: <TasksFormComponent />,
            })}
            sx={{
              background: 'rgba(10,132,255,0.15)',
              border: '1px solid rgba(10,132,255,0.4)',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#0a84ff',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              '&:hover': {
                background: 'rgba(10,132,255,0.25)',
                border: '1px solid #0a84ff'
              }
            }}
          >
            Nueva Tarea
          </Button>
        </Box>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Archivadas toggle */}
          <FormControlLabel
            sx={{
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
              background: showArchivedTasks
                ? 'rgba(10,132,255,0.15)'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${showArchivedTasks ? 'rgba(10,132,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '10px',
              padding: '2px 10px 2px 4px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              fontSize: '0.8rem',
            }}
            control={
              <Switch
                size="small"
                color="info"
                title="Archivadas"
                checked={showArchivedTasks}
                onChange={() => setShowArchivedTasks(!showArchivedTasks)}
              />
            }
            label={
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Archivadas</span>
            }
            labelPlacement="end"
          />

          {/* Excel button */}
          <Button
            onClick={handleExport}
            startIcon={<DownloadOutlinedIcon />}
            size="small"
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: '10px',
              padding: '6px 14px',
              border: '1px solid rgba(48,209,88,0.5)',
              background: 'rgba(48,209,88,0.12)',
              backdropFilter: 'blur(10px)',
              letterSpacing: '0.3px',
              '&:hover': {
                background: 'rgba(48,209,88,0.25)',
                border: '1px solid rgba(48,209,88,0.8)',
                boxShadow: '0 0 12px rgba(48,209,88,0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Excel
          </Button>
        </div>
      </Box>

      {/* Row 2: Tag filter pill */}
      <div style={{ display: "flex", alignItems: "center", marginTop: "6px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
          background: activeTagFilters.length > 0 ? "rgba(255,255,255,0.08)" : "transparent",
          borderRadius: "20px",
          padding: activeTagFilters.length > 0 ? "4px 10px 4px 4px" : "0",
          border: activeTagFilters.length > 0 ? "1px solid rgba(255,255,255,0.2)" : "none",
          backdropFilter: activeTagFilters.length > 0 ? "blur(8px)" : "none",
          transition: "all 0.25s ease",
        }}>
          <Button
            variant={activeTagFilters.length > 0 ? "contained" : "outlined"}
            color="primary"
            size="small"
            startIcon={<LocalOfferIcon />}
            onClick={(e) => setTagAnchorEl(e.currentTarget)}
            sx={{
              color: activeTagFilters.length > 0 ? "white" : "rgba(255,255,255,0.8)",
              borderColor: "rgba(255,255,255,0.4)",
              fontSize: "0.75rem",
              borderRadius: "16px",
              flexShrink: 0,
            }}
          >
            Etiquetas{activeTagFilters.length > 0 ? ` (${activeTagFilters.length})` : ""}
          </Button>

          {activeTagFilters.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              icon={<LocalOfferIcon style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }} />}
              onDelete={() => toggleTagFilter(tag)}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                background: "linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(168,85,247,0.85) 100%)",
                backdropFilter: "blur(8px)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.45)",
                transition: "all 0.2s ease",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                  "&:hover": { color: "white" },
                },
                "&:hover": {
                  boxShadow: "0 4px 14px rgba(99,102,241,0.6)",
                  transform: "translateY(-1px)",
                },
              }}
            />
          ))}
        </div>

        <Popover
          open={Boolean(tagAnchorEl)}
          anchorEl={tagAnchorEl}
          onClose={() => setTagAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <MenuList dense sx={{ maxHeight: 300, overflowY: "auto", minWidth: 200 }}>
            {(() => {
              const baseTasks = (tasks ?? []).filter(t =>
                t.status !== "DELETED" &&
                (showArchivedTasks ? t.status === "ARCHIVED" : t.status !== "ARCHIVED")
              );
              const tagCountMap = new Map<string, number>();
              baseTasks.forEach(t => {
                t.tags?.forEach(tag => {
                  tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
                });
              });
              const availableTags = [...tagCountMap.entries()].sort(([a], [b]) => a.localeCompare(b));

              if (availableTags.length === 0) return (
                <MenuItem disabled><ListItemText primary="Sin etiquetas en las tareas" /></MenuItem>
              );

              return availableTags.map(([tag, count]) => (
                <MenuItem key={tag} onClick={() => toggleTagFilter(tag)} selected={activeTagFilters.includes(tag)}>
                  {activeTagFilters.includes(tag) && <CheckIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />}
                  <ListItemText primary={`${tag} (${count})`} />
                </MenuItem>
              ));
            })()}
            {activeTagFilters.length > 0 && (
              <MenuItem onClick={() => { setActiveTagFilters([]); setTagAnchorEl(null); }} sx={{ borderTop: "1px solid", borderColor: "divider", color: "error.main" }}>
                <ListItemText primary="Limpiar filtros" />
              </MenuItem>
            )}
          </MenuList>
        </Popover>
      </div>
      <TagsInput
        openTagsDialog={openTagsDialog}
        setOpenTagsDialog={setOpenTagsDialog}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedTask={selectedTask as Task}
      />
      <DialogueMultiselect
        title="Responsables"
        open={openOwnersDialog}
        labels={
          users?.filter(u => u.isActive && !u.permissions.includes('PROVIDER')).map((u) =>
            getUserNameByKey(u.key as string, users)
          ) as unknown as string[]
        }
        setOpen={setOpenOwnersDialog}
        value={selectedOwners}
        setValue={setSelectedOwners}
        okButtonText="Guardar"
        okButtonAction={() => handleEditOwner()}
      />
      <DialogueCustomContent
        title="Fecha Límite"
        open={openDueDateDialog}
        setOpen={setOpenDueDateDialog}
        content={
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              label="Fecha Límite"
              name="dueDate"
              format="DD/MM/YYYY"
              value={selectedDueDate}
              onChange={(val) => setSelectedDueDate(val)}
            />
          </LocalizationProvider>
        }
        okText="Guardar"
        okAction={() => handleEditDueDate()}
      />
      <DialogueCustomContent
        title="Notas"
        open={openNotesDialog}
        setOpen={setOpenNotesDialog}
        content={
          <TextField
            id="outlined-basic"
            variant="outlined"
            value={taskNotes}
            onChange={({ target }) => setTaskNotes(target.value)}
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            placeholder="Escribe aquí las notas..."
          />
        }
        okText="Guardar"
        okAction={() => handleEditNotes()}
      />
      <PriorityInput
        open={openPriorityDialog}
        setOpen={setOpenPriorityDialog}
        priority={priority as Priority}
        setPriority={setPriority}
        okText="Guardar"
        okAction={() => handleEditPriority()}
      />
      <DialogueMultiselect
        title="Grupos"
        open={openGroupsDialog}
        labels={
          workgroups
            ?.filter((wg) => wg.isActive)
            .map((wg) => wg.name) as unknown as string[]
        }
        setOpen={setOpenGroupsDialog}
        value={selectedGroups}
        setValue={setSelectedGroups}
        okButtonText="Guardar"
        okButtonAction={() => handleEditGroups()}
      />
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Historial de Tarea</DialogTitle>
        <DialogContent>
          {historyTask?.history && historyTask.history.length > 0 ? (
            <List sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
              {historyTask.history.map((event, idx) => (
                <ListItem key={`${event.modifiedDate}-${idx}`} alignItems="flex-start" sx={{ paddingY: 0.5 }}>
                  <ListItemText
                    primary={
                      `${dayjs(event.modifiedDate).format('DD/MM/YYYY HH:mm')} - ${
                        translateHistoryAction(event.action)
                      } por ${
                        (users && getUserNameByKey(event.modifierUserId, users)) ||
                        event.modifierUserId ||
                        'Desconocido'
                      }`
                    }
                    primaryTypographyProps={{ sx: { fontSize: '0.85rem' } }}
                    secondaryTypographyProps={{ component: 'div', sx: { marginTop: '4px' } }}
                    secondary={
                      <>
                        <Typography component="div" variant="body2" color="textPrimary" sx={{ fontSize: '0.75rem' }}>
                          {event.note ? `Nota: ${event.note}` : ''}
                        </Typography>
                        {event.changes?.length ? (
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '0.72rem' }}>
                            {event.changes.map((change, i) => (
                              <li key={`${event.modifiedDate}-chg-${i}`}>
                                {translateHistoryField(change.field)}: {translateHistoryValue(change.field, change.oldValue)} → {translateHistoryValue(change.field, change.newValue)}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No hay historial disponible para esta tarea.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* FAB for mobile for quick access if top button is scrolled away */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          display: { xs: 'flex', lg: 'none' },
          bgcolor: '#0776e6ff',
          zIndex: 1400, // Above table, below menu
          '&:hover': { bgcolor: '#0070e0' }
        }}
        onClick={() => setModal({
          open: true,
          title: "Nueva Tarea",
          content: <TasksFormComponent />,
        })}
      >
        <AddIcon />
      </Fab>
    </>
  );
}
