import { useEffect, useState } from "react";
import { SubmitHandler, FieldValues, useForm } from "react-hook-form";
import { onValue, ref } from "firebase/database";
import { auth, db } from "../../firebase/firebase.config";
import { Project } from "../../interfaces/Project";
import { AutocompleteField } from "../../interfaces/Shared";
import { GetUserNameByKey } from "../../utils/utils";
import { User } from "../../interfaces/User";

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
import { Task } from "../../interfaces/Task";
import { useTagsStore } from "../../stores/tags/tags.store";
import { TagsService } from "../../services/tags.service";
import { Tag } from "../../interfaces/Tag";

export const TasksFormComponent = () => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const users = useUsersStore((state) => state.users);
  const setUsers = useUsersStore((state) => state.setUsers);
  const projects = useProjectsStore((state) => state.projects);
  const setProjects = useProjectsStore((state) => state.setProjects);
  const tags = useTagsStore((state) => state.tags);
  const setTags = useTagsStore((state) => state.setTags);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setIsLoading(true);
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const values: User[] = Object.entries<User>(data).map(
          ([key, value]) => ({ ...value, key })
        ) as User[];
        setUsers(values.filter((user) => user.isActive) as unknown as User[]);
      } else setUsers([]);

      setIsLoading(false);
    });
  }, [setIsLoading, setUsers]);

  useEffect(() => {
    setIsLoading(true);
    const projects = ref(db, "projects");
    onValue(projects, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const values: Project[] = Object.entries<Project>(data).map(
          ([key, value]) => ({ ...value, key })
        ) as Project[];
        setProjects(
          values.filter(
            (project) => project.status !== "DELETED"
          ) as unknown as Project[]
        );
      } else setProjects([]);

      setIsLoading(false);
    });
  }, [setIsLoading, setProjects]);

  useEffect(() => {
    setIsLoading(true);
    const tagsRef = ref(db, "tags");
    onValue(tagsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setTags(data);
      } else setTags([]);

      setIsLoading(false);
    });
  }, [setIsLoading, setTags]);

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
      data.createdByUserKey = currentUserKey;
      console.log({ data });

      setModal({ ...modal, open: false });
      setIsLoading(true);

      const response = await TaskService.createTask(data);
      if (response.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: "Proyecto creado exitosamente!",
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
      console.error("Error creando tarea.", { error });
      setSnackbar({
        ...snackbar,
        open: true,
        message: "Error creando tarea.",
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
            label="Fecha de Vencimiento"
            name="dueDate"
            onChange={(val, _) =>
              setValue("dueDate", val?.format("DD/MM/YYYY"))
            }
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
                  key={st as string}
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
          Crear Tarea
        </Button>
      </Stack>
    </form>
  );
};
