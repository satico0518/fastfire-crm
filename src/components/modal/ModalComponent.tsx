import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useUiStore } from "../../stores/ui/ui.store";

export interface ModalComponentProps {
  open: boolean;
  title: string;
  text?: string;
  content: React.ReactNode | null;
  actions?: React.ReactNode;
}

export default function ModalComponent() {
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);

  const handleClose = () => {
    setModal({ ...modal, open: false });
  };

  return (
    <React.Fragment>
      <Dialog
        open={modal.open}
        onClose={handleClose}
      >
        <DialogTitle>{modal.title}</DialogTitle>
        <DialogContent>
          {modal.text && <DialogContentText>{modal.text}</DialogContentText>}
          {modal.content}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {modal.actions}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
