import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useUiStore } from "../../stores/ui/ui.store";

export interface ConfirmationComponentProps {
  open: boolean;
  title: string;
  text: string;
  actions: React.ReactNode;
}

export const ConfirmationComponent = () => {
  const confirmation = useUiStore((state) => state.confirmation);
  const open = useUiStore((state) => state.confirmation.open);
  const title = useUiStore((state) => state.confirmation.title);
  const text = useUiStore((state) => state.confirmation.text);
  const actions = useUiStore((state) => state.confirmation.actions);
  const setConfirmation = useUiStore((state) => state.setConfirmation);

  const handleClose = () => setConfirmation({...confirmation, open: false});

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {actions}
      </DialogActions>
    </Dialog>
  );
};
