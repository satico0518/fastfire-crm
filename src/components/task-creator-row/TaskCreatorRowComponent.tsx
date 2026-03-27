import { useState } from "react";
import { Autocomplete, Button, Chip, TextField } from "@mui/material";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import EmojiFlagsOutlinedIcon from "@mui/icons-material/EmojiFlagsOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import { useTagsStore } from "../../stores/tags/tags.store";
import { DialogueMultiselect } from "../dialogs/DialogueMultiselect";
import { User } from "../../interfaces/User";
import { useUsersStore } from "../../stores/users/users.store";
import { getUserKeysByNames, getUserNameByKey } from "../../utils/utils";
import { DialogueCustomContent } from "../dialogs/DialogueCustomContent";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Priority, Task } from "../../interfaces/Task";
import { Dayjs } from "dayjs";
import { useUiStore } from "../../stores/ui/ui.store";
import { TaskService } from "../../services/task.service";
import { useAuhtStore } from "../../stores";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { PriorityInput } from "../priority-input/PriorityInput";
import { TagsService } from "../../services/tags.service";
import { Tag } from "../../interfaces/Tag";

export const TaskCreatorRowComponent = () => {
  const tags = Object.values(useTagsStore((state) => state.tags));
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const currentUser = useAuhtStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);

  const [taskName, setTaskName] = useState<string>("");

  const [openTagsDialog, setOpenTagsDialog] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [openOwnersDialog, setOpenOwnersDialog] = useState(false);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  const [openDueDateDialog, setOpenDueDateDialog] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<Dayjs | null>(null);

  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [taskNotes, setTaskNotes] = useState<string>("");

  const [openPriorityDialog, setOpenPriorityDialog] = useState(false);
  const [priority, setPriority] = useState<Priority | null>();

  const [openGroupsDialog, setOpenGroupsDialog] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const resetForm = () => {
    setTaskName("");
    setSelectedTags([]);
    setSelectedOwners([]);
    setSelectedDueDate(null);
    setTaskNotes("");
    setPriority(null);
    setSelectedGroups([]);
    setIsEditing(false);
  };

  const handleCreateTask = async () => {
    try {
      if (!taskName) {
        setSnackbar({
          open: true,
          message: "El nombre de ta tarea es requerido!",
          severity: "warning",
        });
        return;
      }
      const newTask = {
        name: taskName as string,
        tags: selectedTags,
        ownerKeys: getUserKeysByNames(selectedOwners, users as User[]),
        dueDate: (selectedDueDate?.toDate() as Date) || null,
        notes: (taskNotes as string) || "",
        priority: (priority as Priority) || "LOW",
        workgroupKeys:
          (workgroups
            ?.filter((wg) => selectedGroups.some((sg) => sg === wg.name))
            .map((wg) => wg.key) as string[]) || [],
      };

      const resp = await TaskService.createTask(newTask as Task, currentUser?.key);
      if (resp.result === "OK") {
        setSnackbar({
          open: true,
          message: "Tarea creada exitosamente!",
          severity: "success",
        });
        resetForm();
        setIsEditing(false);
      } else {
        console.error(
          "Error creando tarea en Task Creator ,",
          resp.errorMessage
        );
        setSnackbar({
          open: true,
          message: "Error creando tarea.",
          severity: "error",
        });
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

  const handleAddTag = (tag: Tag | string) => {
    if (!Object.values(tags).some((t) => t === tag)) {
      TagsService.createTag(tag as string);
    }
    if (!selectedTags.some((t) => t === tag)) {
      setSelectedTags([...selectedTags, tag as string]);
    }
  };

  const handleDeleteTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((st) => st !== tag));
  };

  return (
    <div className="task-creator">
      {!isEditing ? (
        <Button
          sx={{ color: "white" }}
          startIcon={<AddTaskOutlinedIcon />}
          onClick={() => setIsEditing(true)}
        >
          Nueva tarea
        </Button>
      ) : (
        <div className="task-creator__row">
          <TextField
            id="outlined-basic"
            label="Nombre de la tarea"
            variant="standard"
            value={taskName}
            onChange={({ target }) => setTaskName(target.value)}
            fullWidth
          />
          <div className="task-creator__row-actions">
            <DialogueCustomContent
              title="Etiquetas"
              open={openTagsDialog}
              setOpen={setOpenTagsDialog}
              content={
                <>
                  <div style={{ maxWidth: "500px" }}>
                    <div className="selected-members" style={{position: 'relative', top: '-30px'}}>
                      {selectedTags.map((st: Tag | string) => (
                        <div
                          key={st as string}
                          className="selected-chip"
                        >
                          <Chip
                            className="selected-chip"
                            size="small"
                            color="success"
                            label={Object.values(st)}
                            onDelete={() => handleDeleteTag(st as string)}
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
                </>
              }
            />
            <Button
              onClick={() => setOpenTagsDialog(!openTagsDialog)}
              startIcon={<LocalOfferOutlinedIcon />}
              sx={{ color: "black" }}
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
            />
            <Button
              onClick={() => setOpenOwnersDialog(!openOwnersDialog)}
              startIcon={<GroupAddOutlinedIcon />}
              sx={{ color: "black" }}
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
            />
            <Button
              onClick={() => setOpenDueDateDialog(!openDueDateDialog)}
              startIcon={<DateRangeOutlinedIcon />}
              sx={{ color: "black" }}
            />
            <DialogueCustomContent
              title="Notas"
              open={openNotesDialog}
              setOpen={setOpenNotesDialog}
              content={
                <TextField
                  id="outlined-basic"
                  variant="standard"
                  value={taskNotes}
                  onChange={({ target }) => setTaskNotes(target.value || "")}
                  fullWidth
                />
              }
            />
            <Button
              onClick={() => setOpenNotesDialog(!openNotesDialog)}
              startIcon={<NoteAltOutlinedIcon />}
              sx={{ color: "black" }}
            />
            <PriorityInput
              open={openPriorityDialog}
              setOpen={setOpenPriorityDialog}
              priority={priority as Priority}
              setPriority={setPriority}
            />
            <Button
              onClick={() => setOpenPriorityDialog(!openPriorityDialog)}
              startIcon={<EmojiFlagsOutlinedIcon />}
              sx={{ color: "black" }}
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
            />
            <Button
              onClick={() => setOpenGroupsDialog(!openGroupsDialog)}
              startIcon={<GroupsOutlinedIcon />}
              sx={{ color: "black" }}
            />
            <Button sx={{ color: "black" }} onClick={() => resetForm()}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTask}
              endIcon={<SaveOutlinedIcon />}
              sx={{ color: "black" }}
            >
              Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
