import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

interface DialogueCustomContentProps {
  width?: string;
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  content: JSX.Element;
  okText?: string;
  okAction?: () => void;
}

export const DialogueCustomContent = ({width = '300px', title, open, setOpen, content, okText = 'Ok', okAction}: DialogueCustomContentProps) => {
  return (
    <Dialog
      onClose={() => setOpen(false)}
      open={open}
      fullWidth
      maxWidth="sm"
      disableRestoreFocus
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '90vh',
          overflow: 'auto'
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', paddingTop: '25px !important', overflow: 'visible' }}>
        <div style={{ maxWidth: width, width: "100%" }}>
          {content}
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="contained" disableElevation onClick={() => {
          setOpen(false);
          if (okAction) okAction();
        }}>{okText}</Button>
      </DialogActions>
    </Dialog>
  );
};
