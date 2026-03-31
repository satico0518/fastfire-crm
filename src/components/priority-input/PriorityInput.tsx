import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Priority } from "../../interfaces/Task";
import { DialogueCustomContent } from "../dialogs/DialogueCustomContent";
import EmojiFlagsOutlinedIcon from "@mui/icons-material/EmojiFlagsOutlined";
import { Dispatch, SetStateAction } from "react";

export interface PriorityInputProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  priority: Priority;
  setPriority: (priority: Priority) => void;
  okText?: string;
  okAction?: () => void;
}

export const PriorityInput = ({
  open,
  setOpen,
  priority,
  setPriority,
  okText,
  okAction,
}: PriorityInputProps) => (
  <DialogueCustomContent
    width="200px"
    maxWidth="xs"
    title="Prioridad"
    open={open}
    setOpen={setOpen}
    content={
      <FormControl fullWidth size="small">
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
    }
    okText={okText}
    okAction={okAction}
  />
);
