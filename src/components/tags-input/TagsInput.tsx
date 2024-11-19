import { Autocomplete, Button, Chip, IconButton, TextField } from "@mui/material";
import { Tag } from "../../interfaces/Tag";
import { DialogueCustomContent } from "../dialogs/DialogueCustomContent";
import { Task } from "../../interfaces/Task";
import { TaskService } from "../../services/task.service";
import { Dispatch, SetStateAction } from "react";
import { useUiStore } from "../../stores/ui/ui.store";
import { useTagsStore } from "../../stores/tags/tags.store";
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

  const handleAddTag = (tag: Tag | string) => {
    if (!Object.values(tags).some((t) => t === tag)) {
      TagsService.createTag(tag as string);
    }
    if (!selectedTags.some((t) => t === tag)) {
      setSelectedTags([...selectedTags, tag as string]);
    }
  };

  const handleAddTags = async () => {
    try {
      if (selectedTask) {
        selectedTask.tags = selectedTags;
        const resp = await TaskService.updateTask(selectedTask);
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
      TaskService.updateTask(task);
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
      for (const key in tags) {
        if (tags[key].toString() === tag) {
          const resp = await TagsService.deleteTagByKey(key);
          if (resp.result === "OK") {
            setSnackbar({
              open: true,
              message: resp.message as string,
              severity: "success",
            });

            setSelectedTags(selectedTags.filter((t) => t !== tag));
          } else {
            setSnackbar({
              open: true,
              message: resp.errorMessage as string,
              severity: "error",
            });
          }
          break;
        }
      }
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
        <div style={{ height: "100px" }}>
          <div
            style={{ maxWidth: "500px", position: "relative", top: "-35px" }}
          >
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
                    onDelete={() =>
                      handleDeleteTag(selectedTask as Task, st as string)
                    }
                  />
                  <IconButton
                    title="Eliminar etiqueta de la base de datos"
                    sx={{ width: "20px" }}
                    onClick={() => handleDeleteTagFromDB(st as string)}
                  >
                    <RemoveCircleOutlinedIcon color="error" />
                  </IconButton>
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
        </div>
      }
      okText="Guardar"
      okAction={() => handleAddTags()}
    />
  );
};
