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
  Box,
  Paper,
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
import { useAuhtStore } from "../../stores";
import { MultiselectComponent } from "../multi-select/MultiselectComponent";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { User } from "../../interfaces/User";

interface TasksFormComponentProps {
  workgroupKey?: string;
}

const darkInputFieldSx = {
  '& label': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
  '& label.Mui-focused': { color: 'white' },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: 'white' },
    '& .MuiInputBase-input': { color: 'white' },
  },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
};

const darkSelectSx = {
  color: 'white',
  borderRadius: '12px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
};

export const TasksFormComponent = ({
  workgroupKey,
}: TasksFormComponentProps) => {
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOwnerKeys, setSelectedOwnerKeys] = useState<string[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>(
    workgroups?.filter((wg) => wg.key === workgroupKey).map((wg) => wg.name) || []
  );
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

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      TagsService.createTag(tag);
    }
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDeleteTag = (tag: string) => {
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
    <Box component="form" onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} sx={{ mt: 1, pb: 4 }}>
      <Stack spacing={2.5} width={"100%"} direction={"column"}>
        <TextField
          label="Nombre de la Tarea"
          type="text"
          {...register("name", { required: "El nombre es obligatorio" })}
          variant="outlined"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message as string}
          required
          sx={darkInputFieldSx}
        />
        
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem' }}>
            Etiquetas
          </Typography>
          <Box className="selected-members" sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedTags.length > 0 ? selectedTags.map((st: string) => (
              <Chip
                key={st}
                size="small"
                label={st}
                onDelete={() => handleDeleteTag(st)}
                sx={{ 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }
                }}
              />
            )) : (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Sin etiquetas seleccionadas</Typography>
            )}
          </Box>
          <Autocomplete
            disablePortal
            options={Array.from(new Set(tags))}
            includeInputInList
            fullWidth
            onChange={(_, tag) => tag && handleAddTag(tag)}
            renderInput={(params) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  {...params}
                  name="tags"
                  label="Buscar o crear etiqueta"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={darkInputFieldSx}
                />
                <Button
                  onClick={() => handleAddTag(params.inputProps.value as string)}
                  variant="contained"
                  sx={{ 
                    minWidth: 40, 
                    p: 0, 
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { background: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <AddCircleOutlinedIcon />
                </Button>
              </Box>
            )}
            PaperComponent={({ children }) => (
              <Paper sx={{ bgcolor: '#1c1c1e', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>{children}</Paper>
            )}
          />
        </Box>

        <MultiselectComponent
          labels={
            users
              ?.filter((u) => u.isActive && !u.permissions?.includes('PROVIDER'))
              .map((u) => getUserNameByKey(u.key as string, users)) as string[]
          }
          title="Responsables Asignados"
          value={selectedOwnerKeys}
          setValue={setSelectedOwnerKeys}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              format={"DD/MM/YYYY"}
              label="Fecha Límite"
              slotProps={{ 
                textField: { 
                  variant: 'outlined', 
                  fullWidth: true, 
                  size: 'medium',
                  sx: darkInputFieldSx
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': { bgcolor: '#1c1c1e', color: 'white', border: '1px solid rgba(255,255,255,0.1)' },
                    '& .MuiPickersDay-root': { color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } },
                    '& .MuiTypography-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiDayCalendar-weekDayLabel': { color: 'rgba(255,255,255,0.5)' },
                    '& .MuiPickersCalendarHeader-label': { color: 'white' },
                    '& .MuiIconButton-root': { color: 'white' }
                  }
                }
              }}
              onChange={(val) => setValue("dueDate", val?.format("DD/MM/YYYY"))}
            />
          </LocalizationProvider>

          <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: 'white' } }}>Prioridad</InputLabel>
            <Select
              value={priority}
              label="Prioridad"
              onChange={({ target }) => setPriority(target.value as Priority)}
              sx={darkSelectSx}
              MenuProps={{
                PaperProps: { sx: { bgcolor: '#1c1c1e', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }
              }}
            >
              <MenuItem value="LOW" sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiFlagsOutlinedIcon sx={{ color: "gray" }} /> Baja
                </Box>
              </MenuItem>
              <MenuItem value="NORMAL" sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiFlagsOutlinedIcon sx={{ color: "#0a84ff" }} /> Normal
                </Box>
              </MenuItem>
              <MenuItem value="HIGH" sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiFlagsOutlinedIcon sx={{ color: "#ff9f0a" }} /> Alta
                </Box>
              </MenuItem>
              <MenuItem value="URGENT" sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiFlagsOutlinedIcon sx={{ color: "#ff453a" }} /> Urgente
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <MultiselectComponent
          labels={
            workgroups
              ?.filter((wg) => wg.isActive)
              .map((w) => getWorkgroupNameByKey(w.key as string, workgroups)) as string[]
          }
          title="Grupos de Trabajo"
          value={selectedGroupKeys}
          setValue={setSelectedGroupKeys}
        />

        <TextField
          label="Notas Adicionales"
          multiline
          rows={3}
          {...register("notes")}
          variant="outlined"
          fullWidth
          sx={darkInputFieldSx}
        />

        <Box sx={{ pt: 1 }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ 
              py: 1.5, 
              borderRadius: '12px', 
              fontWeight: 700, 
              textTransform: 'none',
              background: 'rgba(48,209,88,0.2)',
              border: '1px solid rgba(48,209,88,0.5)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': { 
                background: 'rgba(48,209,88,0.3)',
                border: '1px solid rgba(48,209,88,0.8)'
              }
            }}
          >
            Crear Tarea
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
