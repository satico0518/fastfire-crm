import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriorityInput } from '../PriorityInput';

const mockDialogueCustomContent = jest.fn();

jest.mock('../../dialogs/DialogueCustomContent', () => ({
  DialogueCustomContent: (props: {
    content: React.ReactNode;
    okText?: string;
    okAction?: () => void;
    open: boolean;
    title: string;
    width: string;
    maxWidth: string;
  }) => {
    mockDialogueCustomContent(props);
    return (
      <div data-testid="dialogue-wrapper">
        {props.content}
        {props.okText ? (
          <button type="button" onClick={props.okAction}>
            {props.okText}
          </button>
        ) : null}
      </div>
    );
  },
}));

jest.mock('@mui/material', () => ({
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-control">{children}</div>
  ),
  InputLabel: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <label id={id}>{children}</label>
  ),
  Select: ({
    children,
    value,
    onChange,
    id,
  }: {
    children: React.ReactNode;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    id: string;
  }) => (
    <select
      data-testid="priority-select"
      id={id}
      value={value}
      onChange={(e) => onChange({ target: { value: e.target.value } })}
    >
      {children}
    </select>
  ),
  MenuItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  Box: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@mui/icons-material/EmojiFlagsOutlined', () => () => null);

describe('PriorityInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (overrides?: Partial<React.ComponentProps<typeof PriorityInput>>) => {
    const props: React.ComponentProps<typeof PriorityInput> = {
      open: true,
      setOpen: jest.fn(),
      priority: 'NORMAL',
      setPriority: jest.fn(),
      okText: 'Aceptar',
      okAction: jest.fn(),
      ...overrides,
    };

    render(<PriorityInput {...props} />);
    return props;
  };

  it('passes required dialog props to DialogueCustomContent', () => {
    const props = renderComponent();

    expect(mockDialogueCustomContent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Prioridad',
        open: true,
        width: '200px',
        maxWidth: 'xs',
        okText: 'Aceptar',
        okAction: props.okAction,
      })
    );
  });

  it('renders all priority options', () => {
    renderComponent();

    expect(screen.getByText('Baja')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Urgente')).toBeInTheDocument();
  });

  it('calls setPriority when selecting another option', () => {
    const props = renderComponent({ priority: 'LOW' });

    fireEvent.change(screen.getByTestId('priority-select'), {
      target: { value: 'HIGH' },
    });

    expect(props.setPriority).toHaveBeenCalledWith('HIGH');
  });

  it('renders ok button and executes okAction', () => {
    const okAction = jest.fn();
    renderComponent({ okAction, okText: 'Guardar' });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(okAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when okText is not provided', () => {
    renderComponent({ okText: undefined, okAction: undefined });

    expect(screen.queryByRole('button', { name: /guardar|aceptar/i })).not.toBeInTheDocument();
  });
});
