import { ColorChangeHandler, SwatchesPicker } from "react-color";
import { CSSProperties } from "react";
import Popover from "@mui/material/Popover";

export interface ColorPickerComponentProps {
  visible: boolean;
  handleChange: ColorChangeHandler;
  containerStyle?: CSSProperties;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
}

export const ColorPickerComponent = ({
  visible,
  handleChange,
  containerStyle,
  anchorEl,
  onClose,
}: ColorPickerComponentProps) =>
  visible ? (
    anchorEl ? (
      <Popover
        open={visible}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        PaperProps={{
          sx: {
            overflow: "visible",
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <SwatchesPicker onChangeComplete={handleChange} />
      </Popover>
    ) : (
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: "32px",
          right: "20px",
          ...containerStyle,
        }}
      >
        <SwatchesPicker onChangeComplete={handleChange} />
      </div>
    )
  ) : null;
