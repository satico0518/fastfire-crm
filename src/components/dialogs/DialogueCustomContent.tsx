import { Button, Dialog, DialogTitle } from "@mui/material";

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
      sx={{top: '35%', left: '50%'}}
      onClose={() => setOpen(false)}
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <div style={{ width, padding: 20 }}>
        {content}
        <div style={{ display:'flex', justifyContent: 'end', marginTop: 20 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            setOpen(false);
            if (okAction) okAction();
          }}>{okText}</Button>
        </div>
      </div>
    </Dialog>
  );
};
