import { Autocomplete, Button, Chip, IconButton, TextField, Paper } from "@mui/material";
import { DialogueCustomContent } from "../dialogs/DialogueCustomContent";
import { Task } from "../../interfaces/Task";
import { TaskService } from "../../services/task.service";
import { Dispatch, SetStateAction } from "react";
import { useUiStore } from "../../stores/ui/ui.store";
import { useTagsStore } from "../../stores/tags/tags.store";
import { useAuthStore } from "../../stores";
import { TagsService } from "../../services/tags.service";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";

interface TagsInputProps {
  selectedTask: Task;
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
  openTagsDialog: boolean;
  setOpenTagsDialog: Dispatch<SetStateAction<boolean>>;
  selectedTags: string[];
}

export const TagsInput = ({
  selectedTask,
  setSelectedTags,
  openTagsDialog,
  selectedTags,
  setOpenTagsDialog,
}: TagsInputProps) => {
  const tags = useTagsStore((state) => state.tags);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const currentUser = useAuthStore((state) => state.user);

  const handleAddTag = (tag: string) => {
    if (!tags.some((t) => t === tag)) {
      TagsService.createTag(tag);
    }
    
    if (!selectedTags.some((t) => t === tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddTags = async () => {
    try {
      if (selectedTask) {
        selectedTask.tags = selectedTags;
        const resp = await TaskService.updateTask(selectedTask, currentUser?.key);
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

  const handleDeleteTag = async (task: Task, tag: string) => {
    try {
      task.tags = task.tags.filter((t) => t !== tag);
      await TaskService.updateTask(task, currentUser?.key);
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

  const handleDeleteTagFromDB = async (tag: string) => {
    try {
      // Encontrar la clave de la etiqueta en Firebase (esto es más complejo)
      // Por ahora, solo la eliminamos de la tarea seleccionada
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      setSnackbar({
        open: true,
        message: "Etiqueta eliminada de la tarea",
        severity: "success",
      });
    } catch (error) {
      console.error("Error al intentar eliminar la etiqueta", { error });
      setSnackbar({
        open: true,
        message: "Error al intentar eliminar la etiqueta",
        severity: "error",
      });
    }
  };

  return (
    <DialogueCustomContent
      title="Etiquetas"
      open={openTagsDialog}
      setOpen={setOpenTagsDialog}
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ maxWidth: "500px" }}>
            <div className="selected-members">
              {Array.from(new Set(selectedTags)).map((st: string, idx: number) => (
                <div
                  key={`${st}-${idx}`}  // Key única para evitar aviso de react
                  className="selected-chip"
                >
                  <Chip
                    className="selected-chip"
                    size="small"
                    color="success"
                    label={st}  // Usar directamente el tag
                    onDelete={() =>
                      handleDeleteTag(selectedTask as Task, st)
                    }
                  />
                  <IconButton
                    title="Eliminar etiqueta de la base de datos"
                    sx={{ width: "20px" }}
                    onClick={() => handleDeleteTagFromDB(st)}
                  >
                    <RemoveCircleOutlinedIcon color="error" />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
          <Autocomplete
            disablePortal
            options={[...new Set(tags)]}
            includeInputInList
            fullWidth
            onChange={(_, tag) => tag && handleAddTag(tag)}
            renderInput={(params) => (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <TextField
                  {...params}
                  label="Etiquetas creadas"
                  variant="outlined"
                  autoCapitalize="words"
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    sx: { color: 'white !important', fontWeight: 700 }
                  }}
                  sx={{
                    flex: 1,
                    '& .MuiInputLabel-root': { color: 'white !important', fontWeight: 700 },
                    '& .MuiInputLabel-standard': { color: 'white !important', fontWeight: 700 },
                    '& .MuiFormLabel-root': { color: 'white !important' },
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: '12px',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3) !important' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6) !important' },
                      '&.Mui-focused fieldset': { borderColor: 'white !important' },
                    },
                    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3) !important' },
                    '& .MuiInput-underline:after': { borderBottomColor: 'white !important' },
                    '& .MuiInput-root': { color: 'white !important' },
                  }}
                />
                <Button
                  onClick={() => handleAddTag(params.inputProps.value as string)}
                  sx={{ 
                    minWidth: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': { background: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <AddCircleOutlinedIcon sx={{ color: '#30d158' }} />
                </Button>
              </div>
            )}
            PaperComponent={({ children }) => (
              <Paper sx={{ 
                bgcolor: '#1c1c1e', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.1)',
                '& .MuiAutocomplete-option': {
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  '&[aria-selected="true"]': { bgcolor: 'rgba(255,255,255,0.1)' }
                }
              }}>
                {children}
              </Paper>
            )}
          />
        </div>
      }
      okText="Guardar"
      okAction={() => handleAddTags()}
    />
  );
};
