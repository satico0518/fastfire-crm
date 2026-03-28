import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
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
        fullWidth
        maxWidth="sm"
        open={modal.open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: 'rgba(28, 28, 30, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundImage: 'none',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>
          {modal.title}
        </DialogTitle>
        <DialogContent>
          {modal.text && (
            <DialogContentText sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, fontSize: '0.9rem' }}>
              {modal.text}
            </DialogContentText>
          )}
          <Box sx={{ mt: 1 }}>
            {modal.content}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            sx={{ 
              color: 'rgba(255,255,255,0.5)', 
              textTransform: 'none', 
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }
            }}
          >
            Cancelar
          </Button>
          {modal.actions}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
