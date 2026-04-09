import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkgroupsFormComponent } from '../WorkgroupsFormComponent';
import { Workgroup } from '../../../interfaces/Workgroup';
import { User } from '../../../interfaces/User';

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockUsers: User[] = [
  { key: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', isActive: true, permissions: ['TYG'], workgroupKeys: [] },
  { key: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', isActive: true, permissions: ['PROVIDER'], workgroupKeys: [] },
];

const mockWorkgroup: Workgroup = {
  key: 'wg1',
  name: 'Grupo Alpha',
  description: 'Descripción Alpha',
  color: '#ff0000',
  isPrivate: true,
  memberKeys: ['u1'],
  isActive: true,
};

// ─── Mocks de MUI y Componentes ──────────────────────────────────────────────
jest.mock('../../color-picker/ColorPickerComponent', () => ({
  ColorPickerComponent: ({ visible, handleChange }: any) => 
    visible ? (
      <div 
        data-testid="color-picker" 
        onClick={(e) => {
          e.stopPropagation();
          handleChange({ hex: '#00ff00' });
        }}
      >
        Color Picker Mock
      </div>
    ) : null
}));

// Mock Autocomplete for easier testing
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Autocomplete: (props: any) => {
      const PaperMock = props.PaperComponent || 'div';
      return (
        <div data-testid="autocomplete-mock">
          <input 
            aria-label={props.renderInput?.({}).props.label || 'autocomplete-input'}
            onChange={(e) => {
              const val = props.options.find((o: any) => o.label === e.target.value);
              if (val) props.onChange(null, val);
            }}
          />
          <PaperMock>
            {props.options.map((opt: any) => (
              <button key={opt.key} onClick={() => props.onChange(null, opt)}>{opt.label}</button>
            ))}
          </PaperMock>
        </div>
      );
    }
  };
});

// ─── Mocks de stores ──────────────────────────────────────────────────────────
const mockSetSnackbar = jest.fn();
const mockSetIsLoading = jest.fn();
const mockSetModal = jest.fn();

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector: Function) =>
    selector({
      setSnackbar: mockSetSnackbar,
      setIsLoading: mockSetIsLoading,
      modal: { open: true },
      setModal: mockSetModal,
      snackbar: { open: false },
    })
  ),
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector: Function) => selector({ users: mockUsers })),
}));

// ─── Mocks de servicios ──────────────────────────────────────────────────────
const mockCreateWorkgroup = jest.fn().mockResolvedValue({ result: 'OK' });
const mockModifyWorkgroup = jest.fn().mockResolvedValue({ result: 'OK' });

jest.mock('../../../services/workgroup.service', () => ({
  WorkgroupService: {
    createWorkgroup: (...args: any[]) => mockCreateWorkgroup(...args),
    modifyWorkgroup: (...args: any[]) => mockModifyWorkgroup(...args),
  },
}));

// ─── Mocks de utils ──────────────────────────────────────────────────────────
jest.mock('../../../utils/utils', () => ({
  getUserNameByKey: jest.fn((key: string, users: User[]) => {
    const user = users?.find(u => u.key === key);
    return user ? `${user.firstName} ${user.lastName}` : 'Desconocido';
  }),
}));

describe('WorkgroupsFormComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado inicial', () => {
    test('debe renderizar el formulario de creación por defecto', () => {
      render(<WorkgroupsFormComponent />);
      expect(screen.getByLabelText(/Nombre del Grupo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Descripción \(opcional\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Hacer Privado/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Crear Grupo/i })).toBeInTheDocument();
    });

    test('debe cargar datos en modo edición', () => {
      render(<WorkgroupsFormComponent editingGroup={mockWorkgroup} />);
      expect(screen.getByLabelText(/Nombre del Grupo/i)).toHaveValue('Grupo Alpha');
      expect(screen.getByLabelText(/Descripción \(opcional\)/i)).toHaveValue('Descripción Alpha');
      expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
      // Member Alice should be visible since it's private and Alice is a member
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  describe('interacciones con el formulario', () => {
    test('debe cambiar color al hacer click en el círculo de color', async () => {
      render(<WorkgroupsFormComponent />);
      const colorCircle = screen.getByText('G').parentElement;
      fireEvent.click(colorCircle!);
      
      const colorPicker = screen.getByTestId('color-picker');
      expect(colorPicker).toBeInTheDocument();
      
      fireEvent.click(colorPicker); // Simula selección de #00ff00
      await waitFor(() => {
        expect(screen.queryByTestId('color-picker')).not.toBeInTheDocument();
      });
    });

    test('debe alternar visibilidad de colaboradores al cambiar "Hacer Privado"', () => {
      render(<WorkgroupsFormComponent />);
      // El texto "colaboradores invitados" aparece en la descripción fija, 
      // así que buscamos el Autocomplete que solo aparece cuando es privado.
      expect(screen.queryByTestId('autocomplete-mock')).not.toBeInTheDocument();
      
      const privateSwitch = screen.getByRole('checkbox');
      fireEvent.click(privateSwitch);
      
      expect(screen.getByTestId('autocomplete-mock')).toBeInTheDocument();
    });

    test('debe agregar y remover colaboradores', () => {
      render(<WorkgroupsFormComponent />);
      // Hacerlo privado para ver colaboradores
      fireEvent.click(screen.getByRole('checkbox'));
      
      // La lista de disponibles en el mock de Autocomplete tiene a Alice
      const aliceBtn = screen.getByRole('button', { name: 'Alice Smith' });
      fireEvent.click(aliceBtn);
      
      // Ahora Alice debe estar en un Chip (como seleccionado)
      // En nuestro mock de Autocomplete, ella ya no estaría en la lista de botones si el componente filtra bien
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      
      // El Chip tiene un data-testid en el delete icon (CancelIcon)
      const deleteIcon = screen.getByTestId('CancelIcon');
      fireEvent.click(deleteIcon);
      
      // El Chip debe desaparecer. El botón en Autocomplete volverá a aparecer (según la lógica del componente)
      // Para estar seguros de que el Chip se fue, podemos buscar por rol si tuviera uno, o simplemente verificar
      // que lo que queda es el botón del Autocomplete (que nuestro mock siempre renderiza).
      // En realidad, screen.getByText('Alice Smith') podría seguir encontrando el botón.
      // Vamos a verificar que NO hay un elemento con clase MuiChip-label que diga Alice Smith.
      const chips = document.querySelectorAll('.MuiChip-label');
      const aliceChip = Array.from(chips).find(c => c.textContent === 'Alice Smith');
      expect(aliceChip).toBeUndefined();
    });

    test('no debe agregar el mismo colaborador dos veces', () => {
      render(<WorkgroupsFormComponent />);
      fireEvent.click(screen.getByRole('checkbox'));
      const aliceBtn = screen.getByRole('button', { name: 'Alice Smith' });
      fireEvent.click(aliceBtn);
      
      // Intentar agregar otra vez
      fireEvent.click(aliceBtn);
      
      const chips = document.querySelectorAll('.MuiChip-label');
      const aliceChips = Array.from(chips).filter(c => c.textContent === 'Alice Smith');
      expect(aliceChips.length).toBe(1);
    });
  });

  describe('envío del formulario', () => {
    test('debe llamar a createWorkgroup con los datos correctos', async () => {
      render(<WorkgroupsFormComponent />);
      
      fireEvent.change(screen.getByLabelText(/Nombre del Grupo/i), { target: { value: 'Nuevo Grupo' } });
      fireEvent.change(screen.getByLabelText(/Descripción \(opcional\)/i), { target: { value: 'Nueva Desc' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Crear Grupo/i }));
      
      await waitFor(() => {
        expect(mockCreateWorkgroup).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Nuevo Grupo',
            description: 'Nueva Desc',
            isActive: true,
          }),
          mockUsers
        );
      });
      
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
        open: true,
        severity: 'success'
      }));
    });

    test('debe llamar a modifyWorkgroup en modo edición', async () => {
      render(<WorkgroupsFormComponent editingGroup={mockWorkgroup} />);
      
      fireEvent.change(screen.getByLabelText(/Nombre del Grupo/i), { target: { value: 'Grupo Modificado' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
      
      await waitFor(() => {
        expect(mockModifyWorkgroup).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'wg1',
            name: 'Grupo Modificado',
          }),
          mockUsers
        );
      });
    });

    test('debe mostrar error si el servicio falla', async () => {
      mockCreateWorkgroup.mockResolvedValueOnce({ result: 'ERROR', errorMessage: 'Error de red' });
      render(<WorkgroupsFormComponent />);
      
      fireEvent.change(screen.getByLabelText(/Nombre del Grupo/i), { target: { value: 'Falla' } });
      fireEvent.click(screen.getByRole('button', { name: /Crear Grupo/i }));
      
      await waitFor(() => {
        expect(mockSetSnackbar).toHaveBeenCalledWith(expect.objectContaining({
          open: true,
          message: 'Error de red',
          severity: 'error'
        }));
      });
    });
  });
});
