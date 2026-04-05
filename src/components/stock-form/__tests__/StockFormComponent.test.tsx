import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StockFormComponent } from '../StockFormComponent';
import { useUiStore } from '../../../stores/ui/ui.store';
import { PurchaseService } from '../../../services/purchase.service';
import { Item } from '../../../interfaces/Item';
import userEvent from '@testing-library/user-event';

jest.mock('../../../stores/ui/ui.store');
jest.mock('../../../services/purchase.service');

describe('StockFormComponent', () => {
  const mockSetIsLoading = jest.fn();
  const mockSetModal = jest.fn();
  const mockSetSnackbar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUiStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        setIsLoading: mockSetIsLoading,
        modal: { open: true },
        setModal: mockSetModal,
        snackbar: {},
        setSnackbar: mockSetSnackbar,
      })
    );
  });

  const fillForm = async (user: any) => {
    await user.type(screen.getByLabelText(/Código/i), 'CODE1');
    await user.type(screen.getByLabelText(/Item/i), 'ITEM1');
    await user.type(screen.getByLabelText(/Cantidad/i), '10');
    await user.type(screen.getByLabelText(/Precio/i), '100');
  };

  it('renderiza inputs vacíos en modo creación', () => {
    render(<StockFormComponent />);
    expect(screen.getByLabelText(/Código/i)).toHaveValue('');
    expect(screen.getByLabelText(/Item/i)).toHaveValue('');
  });

  it('renderiza valores por defecto en modo edición', () => {
    const item: Item = { id: 'ID1', name: 'ITEM1', count: 5, price: 50 };
    render(<StockFormComponent editingItem={item} />);
    expect(screen.getByLabelText(/Código/i)).toHaveValue('ID1');
    expect(screen.getByLabelText(/Item/i)).toHaveValue('ITEM1');
    expect(screen.getByLabelText(/Cantidad/i)).toHaveValue(5);
    expect(screen.getByLabelText(/Precio/i)).toHaveValue(50);
  });

  it('llama addItemToStock y maneja exito', async () => {
    const user = userEvent.setup();
    (PurchaseService.addItemToStock as jest.Mock).mockResolvedValue({ result: 'OK' });
    render(<StockFormComponent />);

    await fillForm(user);
    fireEvent.click(screen.getByRole('button', { name: /Crear Item/i }));

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      expect(PurchaseService.addItemToStock).toHaveBeenCalledWith({
        id: 'CODE1',
        name: 'ITEM1',
        count: '10',
        price: '100'
      });
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('llama modifyItem y maneja error db', async () => {
    const user = userEvent.setup();
    (PurchaseService.modifyItem as jest.Mock).mockResolvedValue({ result: 'ERROR DB' });
    const item: Item = { id: 'ID1', name: 'ITEM 1', count: 5, price: 50 };
    render(<StockFormComponent editingItem={item} />);

    fireEvent.click(screen.getByRole('button', { name: /Editar Item/i }));

    await waitFor(() => {
      expect(PurchaseService.modifyItem).toHaveBeenCalled();
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  it('maneja error en promesa', async () => {
    const user = userEvent.setup();
    (PurchaseService.addItemToStock as jest.Mock).mockRejectedValue(new Error('Network fail'));
    render(<StockFormComponent />);

    await fillForm(user);
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }));

    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
