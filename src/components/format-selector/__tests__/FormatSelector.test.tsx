import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormatSelector } from '../FormatSelector';
import { useAuhtStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';
import { FormatService } from '../../../services/format.service';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn(() => ({ user: { permissions: ['ADMIN'] } })),
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn(() => ({
    setSnackbar: jest.fn(),
    setIsLoading: jest.fn(),
  })),
}));

jest.mock('../../../services/format.service', () => ({
  FormatService: {
    createSubmission: jest.fn().mockResolvedValue({ success: true, key: 'testkey' })
  }
}));

describe('FormatSelector', () => {
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
});
