import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { MultiselectComponent } from "../multi-select/MultiselectComponent";
import { Dispatch, SetStateAction } from "react";

interface DialogueMultiselectProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  labels: string[];
  value: unknown;
  setValue: Dispatch<SetStateAction<string[]>>;
  okButtonText?: string;
  okButtonAction?: () => void;
}

export const DialogueMultiselect = ({
  title,
  open,
  setOpen,
  labels,
  value,
  setValue,
  okButtonText = "Ok",
  okButtonAction = () => {},
}: DialogueMultiselectProps) => (
  <Dialog
    onClose={() => setOpen(false)}
    open={open}
    fullWidth
    maxWidth="xs"
    disableRestoreFocus
    PaperProps={{
      sx: {
        bgcolor: '#1c1c1e',
        color: 'white',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'visible'
      }
    }}
  >
    <DialogTitle sx={{ 
      fontSize: '1.25rem', 
      fontWeight: 700, 
      pb: 1,
      color: 'white' 
    }}>
      {title}
    </DialogTitle>
    <DialogContent sx={{ paddingTop: '35px !important', overflow: 'visible' }}>
      <MultiselectComponent
        labels={labels}
        title={title}
        value={value as string[]}
        setValue={setValue}
      />
    </DialogContent>
    <DialogActions sx={{ padding: '20px 24px' }}>
      <Button
        onClick={() => {
          setValue([]);
          setOpen(false);
        }}
        sx={{ 
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': { color: 'white' }
        }}
      >
        Cancelar
      </Button>
      <Button
        variant="contained"
        disableElevation
        onClick={() => {
          setOpen(false);
          okButtonAction();
        }}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
          padding: '8px 24px',
          background: 'linear-gradient(135deg, #0a84ff 0%, #007aff 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #007aff 0%, #0063cc 100%)',
          }
        }}
      >
        {okButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);
