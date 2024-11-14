import { ColorChangeHandler, SwatchesPicker } from "react-color";

export interface ColorPickerComponentProps {
  visible: boolean;
  handleChange: ColorChangeHandler;
}

export const ColorPickerComponent = ({
  visible,
  handleChange,
}: ColorPickerComponentProps) =>
  visible && (
    <div style={{position: 'absolute', zIndex: 1000, top: '32px', right: '20px'}}>
      <SwatchesPicker onChangeComplete={handleChange} />
    </div>
  );
