import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
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
        <InputLabel 
          id="demo-select-small-label"
          sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: 'white' } }}
        >
          Prioridad
        </InputLabel>
        <Select
          labelId="demo-select-small-label"
          id="demo-select-small"
          value={priority}
          label="Prioridad"
          onChange={({ target }) => setPriority(target.value as Priority)}
          sx={{
            color: 'white',
            borderRadius: '12px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#1c1c1e',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                '& .MuiMenuItem-root:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)'
                }
              }
            }
          }}
        >
          <MenuItem value="LOW">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiFlagsOutlinedIcon sx={{ color: "gray" }} /> Baja
            </Box>
          </MenuItem>
          <MenuItem value="NORMAL">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiFlagsOutlinedIcon sx={{ color: "#0a84ff" }} /> Normal
            </Box>
          </MenuItem>
          <MenuItem value="HIGH">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiFlagsOutlinedIcon sx={{ color: "#ff9f0a" }} /> Alta
            </Box>
          </MenuItem>
          <MenuItem value="URGENT">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiFlagsOutlinedIcon sx={{ color: "#ff453a" }} /> Urgente
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    }
    okText={okText}
    okAction={okAction}
  />
);
