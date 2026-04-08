import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

interface DialogueCustomContentProps {
  width?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  content: JSX.Element;
  okText?: string;
  okAction?: () => void;
}

export const DialogueCustomContent = ({width = '300px', maxWidth = 'sm', title, open, setOpen, content, okText = 'Ok', okAction}: DialogueCustomContentProps) => {
  return (
    <Dialog
      onClose={() => setOpen(false)}
      open={open}
      fullWidth
      maxWidth={maxWidth}
      disableRestoreFocus
      disableScrollLock
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '90vh',
          overflow: 'visible',
          bgcolor: '#1c1c1e',
          color: 'white',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        paddingTop: '35px !important', 
        overflow: 'visible',
        color: 'white'
      }}>
        <div style={{ maxWidth: width, width: "100%" }}>
          {content}
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: '20px 24px' }}>
        <Button 
          onClick={() => setOpen(false)}
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
            if (okAction) okAction();
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
          {okText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
