import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LicitationTableComponent from '../LicitationTableComponent';
import { useUiStore } from '../../../stores/ui/ui.store';
import { useStockStore } from '../../../stores/stock/stock.store';
import * as XLSX from 'xlsx';
import { compareLicitationVsStock } from '../../../utils/utils';

// Mock dependencies
jest.mock('../../../stores/ui/ui.store');
jest.mock('../../../stores/stock/stock.store');
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

jest.mock('../../../utils/utils', () => ({
  compareLicitationVsStock: jest.fn(),
  formatToCOP: (v: number) => `$${v}`,
}));

describe('LicitationTableComponent', () => {
  const mockSetItems = jest.fn();
  const mockSetTotalAmount = jest.fn();
  const mockSetSnackbar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useUiStore as unknown as jest.Mock).mockReturnValue(mockSetSnackbar);
    (useStockStore as unknown as jest.Mock).mockReturnValue([
      { name: 'ITEM 1', showInTender: true },
    ]);

    // Mock global FileReader
    const mockFileReader = {
      readAsArrayBuffer: jest.fn(),
      onload: null as any,
      onerror: null as any,
      result: 'mock-buffer',
    };
    global.FileReader = jest.fn(() => mockFileReader) as any;
  });

  const renderComponent = (items: any[] = []) => {
    render(
      <LicitationTableComponent
        items={items}
        setItems={mockSetItems}
        totalAmount={100}
        setTotalAmount={mockSetTotalAmount}
      />
    );
  };

  it('renderiza la tabla y los controles', () => {
    renderComponent([{ id: '1', name: 'Item 1', price: 100, key: 'k1', count: 1, showInTender: true, status: 'ACTIVE' }]);
    expect(screen.getByText(/Subir plantilla/i)).toBeInTheDocument();
    expect(screen.getByText('Valor total licitado:')).toBeInTheDocument();
  });

  it('sale temprano si no hay archivos', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    await waitFor(() => {
       expect(mockSetItems).not.toHaveBeenCalled();
    });
  });

  it('muestra error cuando precios son invalidos', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate valid single file
    const file = new File(['dummy content'], 'example.xlsx', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [file] } });

    const frInstance = (global.FileReader as unknown as jest.Mock).mock.results[0].value;
    (XLSX.read as jest.Mock).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
    (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([ { id: 1, item: 'A', precio: 'invalid' } ]);

    frInstance.onload({ target: { result: 'buffer' } } as any);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        message: expect.stringContaining('PRECIO solo puede contener datos numéricos')
      }));
    });
  });

  it('muestra error cuando longitudes de items no coinciden', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    const frInstance = (global.FileReader as unknown as jest.Mock).mock.results[0].value;
    (XLSX.read as jest.Mock).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
    (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([ { id: 1, item: 'A', precio: 100 } ]);

    (compareLicitationVsStock as jest.Mock).mockReturnValue({ result: false, item: 'length' });
    frInstance.onload({ target: { result: 'buffer' } } as any);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('cantidad de items licitados no corresponde')
      }));
    });
  });

  it('muestra error cuando falta algun item requerido en el excel', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    const frInstance = (global.FileReader as unknown as jest.Mock).mock.results[0].value;
    (XLSX.read as jest.Mock).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
    (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([ { id: 1, item: 'A', precio: 100 } ]);

    (compareLicitationVsStock as jest.Mock).mockReturnValue({ result: false, item: 'ITEM FALTANTE' });
    frInstance.onload({ target: { result: 'buffer' } } as any);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('no ha sido licitado')
      }));
    });
  });

  it('falla promesa y muestra error si FileReader devuelve .onerror', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    const frInstance = (global.FileReader as unknown as jest.Mock).mock.results[0].value;
    frInstance.onerror(new Error('fail upload'));

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error'
      }));
    });
  });

  it('procesa correctamente un excel valido', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    const frInstance = (global.FileReader as unknown as jest.Mock).mock.results[0].value;
    (XLSX.read as jest.Mock).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
    (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([ { id: 1, item: 'ITEM 1', precio: 100 } ]);

    (compareLicitationVsStock as jest.Mock).mockReturnValue({ result: true });
    frInstance.onload({ target: { result: 'buffer' } } as any);

    await waitFor(() => {
      expect(mockSetTotalAmount).toHaveBeenCalledWith(100);
      expect(mockSetItems).toHaveBeenCalledWith([{ id: 1, name: 'ITEM 1', price: 100 }]);
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success'
      }));
    });
  });

  it('muestra error de formato si faltan llaves requeridas', async () => {
    renderComponent();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    const frInstance = (global.FileReader as unknown as jest.Mock).mock.results[0].value;
    (XLSX.read as jest.Mock).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
    // Faltan keys como 'item'
    (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([ { id: 1, precio: 10 } ]);
    (compareLicitationVsStock as jest.Mock).mockReturnValue({ result: true });
    
    frInstance.onload({ target: { result: 'buffer' } } as any);

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
         message: expect.stringContaining('La tabla no tiene el formato requerido')
      }));
    });
  });
});
