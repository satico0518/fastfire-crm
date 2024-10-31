import { useEffect, useState } from "react";
import { SubmitHandler, FieldValues, useForm } from "react-hook-form";
import { auth } from "../../firebase/firebase.config";
import { Project } from "../../interfaces/Project";
import { AutocompleteField, Status } from "../../interfaces/Shared";
import { GetProjectNameByKey, GetUserNameByKey } from "../../utils/utils";

import {
  Stack,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Typography,
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useUsersStore } from "../../stores/users/users.store";
import { useProjectsStore } from "../../stores/projects/projects.store";
import { useUiStore } from "../../stores/ui/ui.store";
import { TaskService } from "../../services/task.service";
import { Task, TaskEvent } from "../../interfaces/Task";
import { useTagsStore } from "../../stores/tags/tags.store";
import { TagsService } from "../../services/tags.service";
import { Tag } from "../../interfaces/Tag";
import { User } from "../../interfaces/User";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import dayjs from "dayjs";

interface ProjectsFormComponentProps {
  editingTask?: Task
}

export const TasksFormComponent = ({editingTask}: ProjectsFormComponentProps) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const users = useUsersStore((state) => state.users);
  const tasks = useTasksStore((state) => state.tasks);
  const projects = useProjectsStore((state) => state.projects);
  const tags = useTagsStore((state) => state.tags);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (editingTask) {
      setValue('name', editingTask.name);
      setValue('projectId', editingTask.projectId );
      setValue('ownerId',editingTask.ownerId);
      setValue("dueDate", dayjs(editingTask.dueDate).format("DD/MM/YYYY"))
      setSelectedTags(editingTask.tags.map((t, i) => ({[i]: t})))
    }
  }, [editingTask, projects, setValue, users])

  const handleAddTag = (tag: Tag | string) => {
    if (!Object.values(tags).some((t) => t === tag)) {
      TagsService.createTag(tag as string);
    }
    if (!selectedTags.some((t) => t === tag)) {
      setSelectedTags([...selectedTags, tag as Tag]);
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    setSelectedTags(selectedTags.filter((st) => st !== tag));
  };

  const onSubmit = async (data: Task) => {
    try {
      const currentUserKey = users?.filter(u => u.id === auth.currentUser?.uid)[0]?.key;
      if (!currentUserKey) {
        setSnackbar({
          ...snackbar,
          open: true,
          message: "Error al intentar crear tarea, Usuario actual no registrado, salga de la aplicacion e intente de nuevo!",
          severity: "error",
        });
        return;
      }

      data.tags = selectedTags as unknown as string[];

      setModal({ ...modal, open: false });
      setIsLoading(true);

      let response;
      if (editingTask){
        const originalTask = tasks?.filter(t => t.id === editingTask.id)[0];
        const history: TaskEvent = {
          originalName: originalTask?.name as string,
          newName: editingTask.name,
          modifiedDate: Date.now(),
          modifierUserId: auth.currentUser?.uid ?? 'NA',
          originalDueDate: originalTask?.dueDate as Date,
          newDueDate: editingTask.dueDate as Date,
          originalOwnerId: originalTask?.ownerId as string,
          newOwnerId: editingTask.ownerId,
          originalStatus: originalTask?.status as Status,
          newStatus: editingTask.status,
        };
        editingTask.history = [...(originalTask?.history ?? []), history];
        response = await TaskService.updateTask(editingTask);
      } else {
        data.createdByUserKey = currentUserKey;
        response = await TaskService.createTask(data);
      }

      if (response.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: `Tarea ${editingTask ? 'modificada' : 'creada'} exitosamente!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          ...snackbar,
          open: true,
          message: response.errorMessage as string,
          severity: "error",
        });
      }
      setSelectedTags([]);
    } catch (error) {
      console.error(`Error ${editingTask ? 'modificando' : 'creando'} tarea.`, { error });
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Error ${editingTask ? 'modificando' : 'creando'} tarea.`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
      <Stack spacing={2} width={"100%"} direction={"column"}>
        <TextField
          label="Nombre"
          type="text"
          {...register("name", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message as string}
          autoCapitalize="words"
          required
        />
        <Autocomplete
          disablePortal
          options={
            projects?.map((project) => ({
              key: project.key,
              label: project.name,
            })) as readonly AutocompleteField[]
          }
          fullWidth
          value={editingTask && {
            key: projects?.filter(p => p.id === editingTask.projectId)[0].key,
            label: GetProjectNameByKey(editingTask.projectId, projects as Project[])
          } }
          onChange={(_, options) => setValue("projectId", options?.key)}
          renderInput={(params) => (
            <TextField
              {...params}
              name="projectId"
              label="Proyecto"
              type="text"
              variant="standard"
              fullWidth
              error={!!errors.projectId}
              helperText={errors.projectId?.message as string}
              autoCapitalize="words"
            />
          )}
        />
        <Autocomplete
          disablePortal
          options={
            users?.map((user) => ({
              key: user.key,
              label: GetUserNameByKey(user.key as string, users),
            })) as readonly AutocompleteField[]
          }
          includeInputInList
          fullWidth
          value={editingTask && {
            key: users?.filter(u => u.key === editingTask.ownerId)[0].key,
            label: GetUserNameByKey(editingTask.ownerId, users as User[])
          }}
          onChange={(_, options) => setValue("ownerId", options?.key)}
          renderInput={(params) => (
            <TextField
              {...params}
              name="ownerId"
              label="Responsable"
              type="text"
              variant="standard"
              fullWidth
              error={!!errors.ownerId}
              helperText={errors.ownerId?.message as string}
              autoCapitalize="words"
            />
          )}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disablePast
            format={"DD/MM/YYYY"}
            label="Fecha Límite"
            name="dueDate"
            onChange={(val, _) =>
              setValue("dueDate", val?.format("DD/MM/YYYY"))
            }
            value={editingTask && dayjs(editingTask.dueDate)}
          />
        </LocalizationProvider>
        <div style={{ maxWidth: "500px" }}>
          <Typography component="span" fontSize={"15px"}>
            Etiquetas:
          </Typography>
          <br />
          <div className="selected-Members">
            {selectedTags.map((st: Tag | string) => {
              console.log({ st });

              return (
                <div
                  key={Object.values(st)[0] as string}
                  className="selected-chip"
                >
                  <Chip
                    className="selected-chip"
                    size="small"
                    color="success"
                    label={Object.values(st)}
                    onDelete={() => handleDeleteTag(st)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <Autocomplete
          disablePortal
          options={Object.values(tags)}
          includeInputInList
          fullWidth
          onChange={(_, tag) => tag && handleAddTag(tag)}
          renderInput={(params) => (
            <div className="tags-selector">
              <TextField
                {...params}
                name="tags"
                label="Etiquetas creadas"
                type="text"
                variant="standard"
                error={!!errors.tags}
                helperText={errors.tags?.message as string}
                autoCapitalize="words"
              />
              {
                <Button
                  onClick={() =>
                    handleAddTag(params.inputProps.value as string)
                  }
                  title="Nueva etiqueta"
                >
                  <AddCircleOutlinedIcon color="success" />
                </Button>
              }
            </div>
          )}
        />
        <Button
          fullWidth
          type="submit"
          variant="outlined"
          size="large"
          color="success"
        >
          {editingTask ? 'Editar Tarea' : 'Crear Tarea'}
        </Button>
      </Stack>
    </form>
  );
};
