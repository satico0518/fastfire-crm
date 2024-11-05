import { ColorChangeHandler, SwatchesPicker } from "react-color";

export interface ColorPickerComponentProps {
  visible: boolean;
  handleChange: ColorChangeHandler;
}

export const ColorPickerComponent = ({
  visible,
  handleChange,
}: ColorPickerComponentProps) => visible && <SwatchesPicker onChangeComplete={handleChange} />;
