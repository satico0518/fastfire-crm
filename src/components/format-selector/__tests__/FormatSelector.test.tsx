import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormatSelector } from '../FormatSelector';
import { useAuthStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';
import { FormatService } from '../../../services/format.service';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

jest.mock('../../../stores', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn(),
}));

jest.mock('../../../services/format.service', () => ({
  FormatService: {
    createSubmission: jest.fn(),
  },
}));

jest.mock('browser-image-compression', () => jest.fn(async (file: File) => file));

jest.mock('../../signature-pad/SignaturePadField', () => ({
  SignaturePadField: ({ label, onChange }: { label: string; onChange: (val: string) => void }) => (
    <button type="button" onClick={() => onChange('firma-base64')}>{label}</button>
  ),
}));

jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DatePicker: ({ onChange }: { onChange: (val: { format: () => string }) => void }) => (
    <input data-testid="mock-date-picker" onChange={() => onChange({ format: () => '01/01/2026' })} />
  ),
  DateTimePicker: ({ onChange }: { onChange: (val: { format: () => string }) => void }) => (
    <input data-testid="mock-datetime-picker" onChange={() => onChange({ format: () => '01/01/2026 10:30' })} />
  ),
}));

jest.mock('../../../config/formatCatalog', () => ({
  FORMAT_CATALOG: [
    {
      id: 'LEGALIZACION_CUENTAS',
      name: 'Legalización de Cuentas',
      description: 'Formato legalización',
      fields: [
        { type: 'text', name: 'solicitante', label: 'Solicitante', required: true },
        {
          type: 'dynamic-group',
          name: 'items',
          label: 'Items',
          subFields: [{ type: 'number', name: 'amount', label: 'Monto item' }],
          addLabel: '+ Añadir ítem',
        },
        {
          type: 'calculated-sum',
          name: 'total',
          label: 'Total',
          calculateSum: 'items.amount',
        },
      ],
    },
    {
      id: 'ACTA_VISITA_MANTENIMIENTO',
      name: 'Acta Visita Mantenimiento',
      description: 'Extintores',
      fields: [
        { type: 'number', name: 'extintores_total', label: 'Total extintores' },
        { type: 'number', name: 'ext_a_10', label: 'A 10 LB' },
        { type: 'text', name: 'ext_otros', label: 'Otros' },
      ],
    },
    {
      id: 'ADICIONALES',
      name: 'Formato Completo',
      description: 'Cobertura amplia',
      fields: [
        { type: 'header', name: 'h1', label: 'Encabezado General' },
        {
          type: 'section',
          name: 'sec_general',
          label: 'Sección General',
          subFields: [
            { type: 'text', name: 'nombre', label: 'Nombre' },
            { type: 'number', name: 'cantidad', label: 'Cantidad' },
          ],
        },
        { type: 'date', name: 'fecha_inicio', label: 'Fecha inicio' },
        { type: 'datetime', name: 'fecha_evento', label: 'Fecha evento', minDateFromField: 'fecha_inicio' },
        { type: 'select', name: 'estado', label: 'Estado', options: ['Pendiente', 'Listo'] },
        { type: 'switch', name: 'aprobado', label: 'Aprobado', options: ['SI', 'NO', 'NA'] },
        { type: 'checkbox-group', name: 'revision_obs_check', label: 'Observación', options: ['observacion'] },
        { type: 'textarea', name: 'revision_obs', label: 'Detalle observación', minRows: 2 },
        { type: 'signature', name: 'firma_tecnico', label: 'Firma técnico' },
        { type: 'image', name: 'foto_evidencia', label: 'Foto evidencia' },
      ],
    },
  ],
}));

describe('FormatSelector', () => {
  const setSnackbar = jest.fn();
  const setIsLoading = jest.fn();
  let clipboardWriteSpy: jest.SpyInstance;

  class MockFileReader {
    public result: string | ArrayBuffer | null = 'data:image/png;base64,mock';
    public onloadend: null | (() => void) = null;

    readAsDataURL() {
      if (this.onloadend) this.onloadend();
    }
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as unknown as { FileReader: typeof FileReader }).FileReader = MockFileReader as unknown as typeof FileReader;

    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async () => undefined },
      });
    }

    clipboardWriteSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (state: { user: { key: string } }) => unknown) =>
      selector({ user: { key: 'user-1' } })
    );

    (useUiStore as unknown as jest.Mock).mockImplementation((selector: (state: { setSnackbar: typeof setSnackbar; setIsLoading: typeof setIsLoading }) => unknown) =>
      selector({ setSnackbar, setIsLoading })
    );

    (FormatService.createSubmission as jest.Mock).mockResolvedValue({ result: 'OK' });
  });

  const setupComponent = () => {
    return render(
      <BrowserRouter>
        <FormatSelector />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    setupComponent();
    expect(screen.getByText(/Legalización de Cuentas/i)).toBeInTheDocument();
  });

  it('copies public link and shows success snackbar', async () => {
    setupComponent();

    const user = userEvent.setup();
    const copyButtons = screen.getAllByTitle('Copiar enlace público');
    await user.click(copyButtons[0]);

    expect(setSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', message: 'Enlace copiado al portapapeles' })
    );
  });

  it('shows error snackbar when copy link fails', async () => {
    clipboardWriteSpy.mockRejectedValueOnce(new Error('clipboard error'));
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getAllByTitle('Copiar enlace público')[0]);

    await waitFor(() => {
      expect(setSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', message: 'Error al copiar el enlace' })
      );
    });
  });

  it('validates required fields before submit', async () => {
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Legalización de Cuentas'));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(setSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warning' })
    );
    expect(FormatService.createSubmission).not.toHaveBeenCalled();
  });

  it('blocks submit when extintores total does not match sum', async () => {
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Acta Visita Mantenimiento'));

    const dialog = screen.getByRole('dialog');
    const [totalInput, a10Input] = within(dialog).getAllByRole('spinbutton');

    await user.type(totalInput, '5');
    await user.type(a10Input, '3');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    expect(setSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        message: expect.stringContaining('no coincide con el total declarado'),
      })
    );
    expect(FormatService.createSubmission).not.toHaveBeenCalled();
  });

  it('submits format and injects calculated sum into payload', async () => {
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Legalización de Cuentas'));

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Carlos');
    await user.type(within(dialog).getByRole('spinbutton'), '2000');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(FormatService.createSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          formatTypeId: 'LEGALIZACION_CUENTAS',
          status: 'SUBMITTED',
          createdByUserKey: 'user-1',
          data: expect.objectContaining({
            solicitante: 'Carlos',
            total: 2000,
          }),
        })
      );
    });

    expect(setIsLoading).toHaveBeenNthCalledWith(1, true);
    expect(setIsLoading).toHaveBeenNthCalledWith(2, false);
    expect(setSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', message: 'Formato enviado exitosamente!' })
    );
  });

  it('shows error snackbar when service returns non-OK result', async () => {
    (FormatService.createSubmission as jest.Mock).mockResolvedValueOnce({
      result: 'ERROR',
      errorMessage: 'Fallo API',
    });

    setupComponent();
    const user = userEvent.setup();

    await user.click(screen.getByText('Legalización de Cuentas'));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Ana');
    await user.type(within(dialog).getByRole('spinbutton'), '100');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(setSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', message: 'Fallo API' })
      );
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Legalización de Cuentas'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('adds and removes dynamic-group items', async () => {
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Legalización de Cuentas'));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Ítem 1')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: '+ Añadir ítem' }));
    expect(within(dialog).getByText('Ítem 2')).toBeInTheDocument();

    const deleteButtons = within(dialog).getAllByRole('button');
    const deleteItemButtons = deleteButtons.filter((btn) =>
      btn.querySelector('[data-testid="DeleteOutlineIcon"]')
    );
    await user.click(deleteItemButtons[0]);

    await waitFor(() => {
      expect(within(dialog).queryByText('Ítem 2')).not.toBeInTheDocument();
    });
  });

  it('allows submit for extintores mismatch when ext_otros has value', async () => {
    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Acta Visita Mantenimiento'));

    const dialog = screen.getByRole('dialog');
    const [totalInput, a10Input] = within(dialog).getAllByRole('spinbutton');
    const otrosInput = within(dialog).getByRole('textbox');

    await user.type(totalInput, '8');
    await user.type(a10Input, '3');
    await user.type(otrosInput, 'unidades especiales');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(FormatService.createSubmission).toHaveBeenCalledWith(
        expect.objectContaining({ formatTypeId: 'ACTA_VISITA_MANTENIMIENTO' })
      );
    });
    expect(setSnackbar).not.toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', message: expect.stringContaining('no coincide con el total declarado') })
    );
  });

  it('does not submit when there is no authenticated user', async () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (state: { user: null }) => unknown) =>
      selector({ user: null })
    );

    setupComponent();

    const user = userEvent.setup();
    await user.click(screen.getByText('Legalización de Cuentas'));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Sin User');
    await user.type(within(dialog).getByRole('spinbutton'), '100');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    expect(FormatService.createSubmission).not.toHaveBeenCalled();
    expect(setIsLoading).not.toHaveBeenCalled();
  });

  it('renders advanced field types and toggles observation textarea', async () => {
    setupComponent();
    const user = userEvent.setup();

    await user.click(screen.getByText('Formato Completo'));
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByText('Encabezado General')).toBeInTheDocument();
    expect(within(dialog).getByText('Sección General')).toBeInTheDocument();
    expect(within(dialog).getByText('Firma técnico')).toBeInTheDocument();
    expect(within(dialog).queryByText('Detalle observación')).not.toBeInTheDocument();

    await user.click(within(dialog).getByLabelText('Observación'));
    expect(within(dialog).getAllByText('Detalle observación').length).toBeGreaterThan(0);
  });

  it('uploads image with base64 path and allows deleting preview', async () => {
    setupComponent();
    const user = userEvent.setup();

    await user.click(screen.getByText('Formato Completo'));
    const dialog = screen.getByRole('dialog');
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    const smallFile = new File(['abc'], 'small.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [smallFile] } });

    await waitFor(() => {
      expect(within(dialog).getByAltText('Foto evidencia')).toBeInTheDocument();
    });

    const deleteImageBtn = within(dialog)
      .getAllByRole('button')
      .find((btn) => btn.querySelector('[data-testid="DeleteOutlineIcon"]'));

    expect(deleteImageBtn).toBeDefined();
    await user.click(deleteImageBtn as HTMLElement);

    await waitFor(() => {
      expect(within(dialog).queryByAltText('Foto evidencia')).not.toBeInTheDocument();
    });
  });

  it('handles large image through cloudinary branch with existing script', async () => {
    const createUploadWidget = jest.fn((_opts, cb) => {
      cb(null, { event: 'success', info: { secure_url: 'https://cdn.test/foto.jpg' } });
      return { open: jest.fn() };
    });

    (window as unknown as { cloudinary: { createUploadWidget: typeof createUploadWidget } }).cloudinary = {
      createUploadWidget,
    };

    const existingScript = document.createElement('script');
    existingScript.id = 'uw-format';
    document.head.appendChild(existingScript);

    (imageCompression as unknown as jest.Mock).mockResolvedValueOnce(
      new File([new Uint8Array(9 * 1024 * 1024 + 10)], 'huge.png', { type: 'image/png' })
    );

    setupComponent();
    const user = userEvent.setup();
    await user.click(screen.getByText('Formato Completo'));

    const dialog = screen.getByRole('dialog');
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    const sourceFile = new File(['x'], 'origin.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [sourceFile] } });

    await waitFor(() => {
      expect(createUploadWidget).toHaveBeenCalled();
      expect(within(dialog).getByAltText('Foto evidencia')).toBeInTheDocument();
    });
  });

  it('handles compression failure and still falls back to original file', async () => {
    (imageCompression as unknown as jest.Mock).mockRejectedValueOnce(new Error('compression failed'));

    setupComponent();
    const user = userEvent.setup();
    await user.click(screen.getByText('Formato Completo'));

    const dialog = screen.getByRole('dialog');
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['def'], 'fallback.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(within(dialog).getByAltText('Foto evidencia')).toBeInTheDocument();
    });
  });
});
