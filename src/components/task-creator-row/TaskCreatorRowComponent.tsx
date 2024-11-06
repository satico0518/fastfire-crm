import { Button, TextField } from "@mui/material";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import EmojiFlagsOutlinedIcon from '@mui/icons-material/EmojiFlagsOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import { useState } from "react";

export const TaskCreatorRowComponent = () => {
  const [isEditing, setIsEditing] = useState(false);

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
          <TextField id="outlined-basic" label="Nombre de la tarea" variant="standard" fullWidth/>
          <div className="task-creator__row-actions">
            <Button startIcon={<LocalOfferOutlinedIcon />}  sx={{color: 'black'}}/>
            <Button startIcon={<GroupAddOutlinedIcon />}  sx={{color: 'black'}}/>
            <Button startIcon={<DateRangeOutlinedIcon />}  sx={{color: 'black'}}/>
            <Button startIcon={<NoteAltOutlinedIcon />}  sx={{color: 'black'}}/>
            <Button startIcon={<EmojiFlagsOutlinedIcon />}  sx={{color: 'black'}}/>
            <Button sx={{color: 'black'}} onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button endIcon={<SaveOutlinedIcon />} sx={{color: 'black'}}>Guardar</Button>
          </div>
        </div>
      )}
    </div>
  );
};
