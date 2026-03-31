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
          startIcon={<AddTaskOutlinedIcon />}
          onClick={() => setIsEditing(true)}
          size="small"
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: '10px',
            padding: '6px 14px',
            border: '1px solid rgba(10,132,255,0.5)',
            background: 'rgba(10,132,255,0.12)',
            backdropFilter: 'blur(10px)',
            letterSpacing: '0.3px',
            '&:hover': {
              background: 'rgba(10,132,255,0.25)',
              border: '1px solid rgba(10,132,255,0.8)',
              boxShadow: '0 0 12px rgba(10,132,255,0.3)',
            },
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          Nueva tarea
        </Button>
      ) : (
        <div className="task-creator__row">
          <TextField
            id="outlined-basic"
            placeholder="Nombre de la tarea..."
            variant="standard"
            value={taskName}
            onChange={({ target }) => setTaskName(target.value)}
            fullWidth
            sx={{
              flex: 1, // Para que ocupe todo el espacio disponible en el flex container
              minWidth: '200px', // Ancho mínimo para que sea visible
              '& .MuiInput-root': {
                color: 'white',
                '&:before': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover:not(.Mui-disabled):before': { borderColor: 'rgba(255,255,255,0.5)' },
                fontSize: '0.85rem'
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }
            }}
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
              size="small"
              onClick={() => setOpenTagsDialog(!openTagsDialog)}
              startIcon={<LocalOfferOutlinedIcon />}
              sx={{ color: "white", minWidth: 40, p: '4px' }}
            />
            <Button
              size="small"
              onClick={() => setOpenOwnersDialog(!openOwnersDialog)}
              startIcon={<GroupAddOutlinedIcon />}
              sx={{ color: "white", minWidth: 40, p: '4px' }}
            />
            <DialogueMultiselect
              title="Responsables"
              open={openOwnersDialog}
              setOpen={setOpenOwnersDialog}
              value={selectedOwners}
              setValue={setSelectedOwners}
              labels={
                users?.filter(u => u.isActive && !u.permissions?.includes('PROVIDER')).map((u) =>
                  getUserNameByKey(u.key as string, users)
                ) as unknown as string[]
              }
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
              size="small"
              onClick={() => setOpenDueDateDialog(!openDueDateDialog)}
              startIcon={<DateRangeOutlinedIcon />}
              sx={{ color: "white", minWidth: 40, p: '4px' }}
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
              size="small"
              onClick={() => setOpenNotesDialog(!openNotesDialog)}
              startIcon={<NoteAltOutlinedIcon />}
              sx={{ color: "white", minWidth: 40, p: '4px' }}
            />
            <PriorityInput
              open={openPriorityDialog}
              setOpen={setOpenPriorityDialog}
              priority={priority as Priority}
              setPriority={setPriority}
            />
            <Button
              size="small"
              onClick={() => setOpenPriorityDialog(!openPriorityDialog)}
              startIcon={<EmojiFlagsOutlinedIcon />}
              sx={{ color: "white", minWidth: 40, p: '4px' }}
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
              size="small"
              onClick={() => setOpenGroupsDialog(!openGroupsDialog)}
              startIcon={<GroupsOutlinedIcon />}
              sx={{ color: "white", minWidth: 40, p: '4px' }}
            />
            <div style={{ width: '8px' }} /> {/* Spacer */}
            <Button 
              size="small"
              sx={{ color: "rgba(255,255,255,0.6)", textTransform: 'none' }} 
              onClick={() => resetForm()}
            >
              Cancelar
            </Button>
            <Button
              size="small"
              onClick={handleCreateTask}
              variant="contained"
              endIcon={<SaveOutlinedIcon />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
