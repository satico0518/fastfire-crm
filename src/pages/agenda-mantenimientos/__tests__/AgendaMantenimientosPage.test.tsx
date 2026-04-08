import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgendaMantenimientosPage } from '../AgendaMantenimientosPage';
import { BrowserRouter } from 'react-router-dom';
import { useAuhtStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';
import { MaintenanceService } from '../../../services/maintenance.service';
import dayjs from 'dayjs';

jest.mock('../../../stores');
jest.mock('../../../stores/ui/ui.store');
jest.mock('../../../services/maintenance.service');

// Mock child components to avoid huge rendering overhead
jest.mock('../components/ScheduleDayBlock', () => ({
  ScheduleDayBlock: ({ dateLabel, onEdit, schedules }: any) => (
    <div data-testid="schedule-block">
      {dateLabel}
      <button onClick={() => onEdit(schedules[0])}>Edit Item</button>
    </div>
  )
}));
jest.mock('../components/CalendarGridView', () => ({
  CalendarGridView: ({ onOpenCreation }: any) => (
    <div data-testid="calendar-grid">
      <button onClick={() => onOpenCreation('2023-01-01')}>Open Creation Grid</button>
    </div>
  )
}));
jest.mock('../components/ScheduleCreationModal', () => ({
  ScheduleCreationModal: ({ open, onClose, onSave }: any) => open ? (
    <div data-testid="creation-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave({ title: 'Test Schedule', type: 'MAINTENANCE' })}>Save</button>
    </div>
  ) : null
}));

describe('AgendaMantenimientosPage', () => {
  const mockSetSnackbar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { permissions: ['ADMIN', 'PLANNER', 'MANAGER'] } })
    );

    (useUiStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        setSnackbar: mockSetSnackbar,
      })
    );

    (MaintenanceService.subscribeToSchedules as jest.Mock).mockImplementation((callback) => {
      // simulate initial load and some past and future schedules to cover group mapping
      const pastSchedule = { id: 's1', type: 'MAINTENANCE', dateStr: dayjs().subtract(1, 'month').format('YYYY-MM-DD') };
      const todaySchedule = { id: 's2', type: 'MAINTENANCE', dateStr: dayjs().format('YYYY-MM-DD') };
      const futureSchedule = { id: 's3', type: 'MAINTENANCE', dateStr: dayjs().add(20, 'day').format('YYYY-MM-DD') };
      callback([pastSchedule, todaySchedule, futureSchedule]);
      return jest.fn(); // unsubscribe mock
    });
  });

  const setupComponent = () => {
    return render(
      <BrowserRouter>
        <AgendaMantenimientosPage />
      </BrowserRouter>
    );
  };

  it('renderiza Unauthorized si no tiene permisos', () => {
    (useAuhtStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { permissions: ['NO_PERM'] } })
    );

    setupComponent();
    expect(screen.queryByText(/Agenda/i)).not.toBeInTheDocument();
  });

  it('renderiza calendario por defecto en modo mes', () => {
    setupComponent();
    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
  });

  it('permite cambiar a modo dia y ver listado (mobile y desktop)', () => {
    setupComponent();
    
    // Changing to Day view (Día)
    const dayBtn = screen.getAllByRole('button', { name: /Día|DÍA/i })[0];
    fireEvent.click(dayBtn);

    // After clicking day view, it should render schedule blocks!
    expect(screen.queryByTestId('calendar-grid')).not.toBeInTheDocument();
    
    // There are day words
    expect(screen.getAllByText(/HOY/i).length).toBeGreaterThan(0);
  });

  it('permite cambiar a modo semana', () => {
    setupComponent();
    
    const weekBtn = screen.getAllByRole('button', { name: /Semana/i })[0];
    fireEvent.click(weekBtn);

    expect(screen.queryByTestId('calendar-grid')).not.toBeInTheDocument();
  });

  it('permite navegar HOY, anterior, siguiente dia', () => {
    setupComponent();
    const dayBtn = screen.getAllByRole('button', { name: /Día/i })[0];
    fireEvent.click(dayBtn);

    // Prev/Next/Hoy buttons are rendered
    const hoyBtn = screen.getByRole('button', { name: /HOY/i });
    fireEvent.click(hoyBtn);
  });

  it('debe manejar handleCreateSchedule exito y error', async () => {
    setupComponent();
    
    // simulate opening creation
    const openBtn = screen.getByText('Open Creation Grid');
    fireEvent.click(openBtn);

    expect(screen.getByTestId('creation-modal')).toBeInTheDocument();

    (MaintenanceService.createSchedule as jest.Mock).mockResolvedValue({ result: 'OK' });
    
    // trigger save inside mock
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(MaintenanceService.createSchedule).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Schedule' }));
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
    
    // test error
    (MaintenanceService.createSchedule as jest.Mock).mockResolvedValue({ result: 'ERROR', errorMessage: 'DB Error' });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  it('debe manejar handleEditSchedule (edita desde bloque)', () => {
    setupComponent();
    // change to Day mode so ScheduleDayBlock is rendered
    fireEvent.click(screen.getAllByRole('button', { name: /Día/i })[0]);

    const editBtns = screen.getAllByText('Edit Item');
    fireEvent.click(editBtns[0]); // edits the first schedule the mock sent

    expect(screen.getByTestId('creation-modal')).toBeInTheDocument();
  });

  it('cierra modal handleCloseCreation', () => {
    setupComponent();
    const openBtn = screen.getByText('Open Creation Grid');
    fireEvent.click(openBtn);
    
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    
    expect(screen.queryByTestId('creation-modal')).not.toBeInTheDocument();
  });
});
