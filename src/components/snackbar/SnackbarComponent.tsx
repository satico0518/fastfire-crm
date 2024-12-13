import { Alert, Snackbar, SnackbarCloseReason } from "@mui/material";
import { useUiStore } from "../../stores/ui/ui.store";

export interface SnackbarComponentProps {
  open: boolean;
  message: string;
  severity: 'info'|'error'|'success'|'warning';
  duration?: number;
}

export const SnackbarComponent = () => {
  const open = useUiStore((state) => state.snackbar.open);
  const message = useUiStore((state) => state.snackbar.message);
  const severity = useUiStore((state) => state.snackbar.severity);
  const duration = useUiStore((state) => state.snackbar.duration);
  const setSnackbar = useUiStore((state) => state.setSnackbar);

//   const handleClose = () => setSnackbar({ open: false, message: "" });
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ open: false, message: "", severity: "info" });
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={open}
      onClose={handleClose}
      autoHideDuration={duration || 3000}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
