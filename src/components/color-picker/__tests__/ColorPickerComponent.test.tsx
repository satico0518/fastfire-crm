import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ColorPickerComponent } from '../ColorPickerComponent';

const mockSwatchesPicker = jest.fn();

jest.mock('react-color', () => ({
  SwatchesPicker: ({ onChangeComplete }: { onChangeComplete: (...args: unknown[]) => void }) => {
    mockSwatchesPicker();
    return (
      <button
        data-testid="swatches-picker"
        onClick={() => onChangeComplete({ hex: '#00ff00' }, {})}
        type="button"
      >
        mock-swatches
      </button>
    );
  },
}));

describe('ColorPickerComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when visible is false', () => {
    const handleChange = jest.fn();

    render(<ColorPickerComponent visible={false} handleChange={handleChange} />);

    expect(screen.queryByTestId('swatches-picker')).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
    expect(mockSwatchesPicker).not.toHaveBeenCalled();
  });

  it('renders SwatchesPicker when visible is true', () => {
    const handleChange = jest.fn();

    render(<ColorPickerComponent visible={true} handleChange={handleChange} />);

    expect(screen.getByTestId('swatches-picker')).toBeInTheDocument();
    expect(mockSwatchesPicker).toHaveBeenCalledTimes(1);
  });

  it('forwards onChangeComplete events to handleChange', () => {
    const handleChange = jest.fn();

    render(<ColorPickerComponent visible={true} handleChange={handleChange} />);

    fireEvent.click(screen.getByTestId('swatches-picker'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ hex: '#00ff00' }),
      expect.any(Object)
    );
  });

  it('hides picker when visibility toggles from true to false', () => {
    const handleChange = jest.fn();

    const { rerender } = render(
      <ColorPickerComponent visible={true} handleChange={handleChange} />
    );
    expect(screen.getByTestId('swatches-picker')).toBeInTheDocument();

    rerender(<ColorPickerComponent visible={false} handleChange={handleChange} />);

    expect(screen.queryByTestId('swatches-picker')).not.toBeInTheDocument();
  });
});
