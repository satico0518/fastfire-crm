import { useState } from "react";
import { SubmitHandler, FieldValues, useForm } from "react-hook-form";
import {
  getUserKeysByNames,
  getUserNameByKey,
  getWorkgroupNameByKey,
} from "../../utils/utils";

import {
  Stack,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import EmojiFlagsOutlinedIcon from "@mui/icons-material/EmojiFlagsOutlined";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useUsersStore } from "../../stores/users/users.store";
import { useUiStore } from "../../stores/ui/ui.store";
import { TaskService } from "../../services/task.service";
import { Priority, Task } from "../../interfaces/Task";
import { useTagsStore } from "../../stores/tags/tags.store";
import { TagsService } from "../../services/tags.service";
import { Tag } from "../../interfaces/Tag";
import { useAuhtStore } from "../../stores";
import { MultiselectComponent } from "../multi-select/MultiselectComponent";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { User } from "../../interfaces/User";

interface TasksFormComponentProps {
  workgroupKey?: string;
}

export const TasksFormComponent = ({
  workgroupKey,
}: TasksFormComponentProps) => {
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedOwnerKeys, setSelectedOwnerKeys] = useState<string[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([
    workgroups?.filter((wg) => wg.key === workgroupKey)[0].name as string,
  ]);
  const [priority, setPriority] = useState<Priority>("LOW");
  const currentUser = useAuhtStore((state) => state.user);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const tags = useTagsStore((state) => state.tags);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      if (!currentUser?.key) {
        setSnackbar({
          ...snackbar,
          open: true,
          message:
            "Error al intentar crear tarea, Usuario actual no registrado, salga de la aplicacion e intente de nuevo!",
          severity: "error",
        });
        return;
      }

      setModal({ ...modal, open: false });
      setIsLoading(true);

      data.tags = selectedTags as unknown as string[];
      data.priority = (priority as Priority) || "LOW";
      data.createdByUserKey = currentUser.key;
      data.ownerKeys = getUserKeysByNames(selectedOwnerKeys, users as User[]);
      data.workgroupKeys = workgroups?.filter((wg) => selectedGroupKeys.some((sg) => sg === wg.name)).map((wg) => wg.key) as string[];

      const response = await TaskService.createTask(data);

      if (response.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: `Tarea creada exitosamente!`,
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
      setSelectedOwnerKeys([]);
      setSelectedGroupKeys([]);
    } catch (error) {
      console.error(`Error creando tarea.`, { error });
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Error creando tarea.`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
      <Stack spacing={2} width={"500px"} direction={"column"}>
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

        <div style={{ maxWidth: "500px" }}>
          <Typography component="span" fontSize={"15px"}>
            Etiquetas:
          </Typography>
          <br />
          <div className="selected-members">
            {selectedTags.map((st: Tag | string) => (
              <div
                key={Object.values(st)[0] as string}
                className="selected-chip"
              >
                <Chip
                  className="selected-chip"
                  size="small"
                  color="success"
                  label={Object.values(st)}
                  onDelete={() => handleDeleteTag(st as Tag)}
                />
              </div>
            ))}
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
        <MultiselectComponent
          labels={
            users
              ?.filter((u) => u.isActive)
              .map((u) => getUserNameByKey(u.key as string, users)) as string[]
          }
          title="Responsables"
          value={selectedOwnerKeys}
          setValue={setSelectedOwnerKeys}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disablePast
            format={"DD/MM/YYYY"}
            label="Fecha Límite"
            name="dueDate"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onChange={(val, _) =>
              setValue("dueDate", val?.format("DD/MM/YYYY"))
            }
          />
        </LocalizationProvider>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="demo-select-small-label">Prioridad</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={priority}
            label="Prioridad"
            onChange={({ target }) => setPriority(target.value as Priority)}
          >
            <MenuItem value="LOW">
              <EmojiFlagsOutlinedIcon sx={{ color: "gray" }} /> Baja
            </MenuItem>
            <MenuItem value="NORMAL">
              <EmojiFlagsOutlinedIcon sx={{ color: "blue" }} /> Normal
            </MenuItem>
            <MenuItem value="HIGH">
              <EmojiFlagsOutlinedIcon sx={{ color: "orange" }} /> Alta
            </MenuItem>
            <MenuItem value="URGENT">
              <EmojiFlagsOutlinedIcon sx={{ color: "red" }} /> Urgente
            </MenuItem>
          </Select>
        </FormControl>
        <MultiselectComponent
          labels={
            workgroups
              ?.filter((wg) => wg.isActive)
              .map((w) =>
                getWorkgroupNameByKey(w.key as string, workgroups)
              ) as string[]
          }
          title="Grupos de trabajo"
          value={selectedGroupKeys}
          setValue={setSelectedGroupKeys}
        />
        <TextField
          label="Notas"
          type="text"
          {...register("notes")}
          variant="standard"
          fullWidth
          error={!!errors.notes}
          helperText={errors.notes?.message as string}
          autoCapitalize="words"
          required
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
