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
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={{ paddingTop: '10px !important' }}>
      <MultiselectComponent
        labels={labels}
        title={title}
        value={value as string[]}
        setValue={setValue}
      />
    </DialogContent>
    <DialogActions sx={{ padding: '16px 24px' }}>
      <Button
        onClick={() => {
          setValue([]);
          setOpen(false);
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
      >
        {okButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);
