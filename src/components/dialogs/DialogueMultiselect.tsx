import { Button, Dialog, DialogTitle } from "@mui/material";
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
    sx={{ top: "35%", left: "50%" }}
    onClose={() => setOpen(false)}
    open={open}
  >
    <DialogTitle>{title}</DialogTitle>
    <div style={{ width: "300px", padding: 20 }}>
      <MultiselectComponent
        labels={labels}
        title={title}
        value={value as string[]}
        setValue={setValue}
      />
      <div style={{ display: "flex", justifyContent: "end", marginTop: 20 }}>
        <Button
          onClick={() => {
            setValue([]);
            setOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => {
            setOpen(false);
            okButtonAction();
          }}
        >
          {okButtonText}
        </Button>
      </div>
    </div>
  </Dialog>
);
