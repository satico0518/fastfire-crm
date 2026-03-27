import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TagsInput } from '../TagsInput';
import { Task } from '../../../interfaces/Task';

// Mock de los stores
jest.mock('../../../stores/tags/tags.store', () => ({
  useTagsStore: jest.fn((selector) => {
    const state = {
      tags: ['tag1', 'tag2', 'tag3', 'tag4'],
      loadTags: jest.fn(),
      setTags: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: jest.fn((selector) => {
    const state = {
      snackbar: { open: false, message: '', severity: 'success' },
      setSnackbar: jest.fn(),
      confirmation: { open: false, title: '', content: '', onConfirm: jest.fn() },
      setConfirmation: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

const mockTask: Task = {
  id: '1',
  key: '1',
  name: 'Tarea de prueba',
  tags: ['tag1', 'tag2'],
  priority: 'NORMAL',
  status: 'TODO',
  createdDate: Date.now(),
  dueDate: '',
  notes: '',
  history: [],
  createdByUserKey: 'user1',
  workgroupKeys: ['wg1'],
  ownerKeys: ['user1']
};

describe('TagsInput', () => {
  const mockSetSelectedTags = jest.fn();
  const mockSetOpenTagsDialog = jest.fn();

  test('renderiza el componente correctamente', () => {
    render(
      <TagsInput
        selectedTask={mockTask}
        setSelectedTags={mockSetSelectedTags}
        openTagsDialog={true}
        selectedTags={[]}
        setOpenTagsDialog={mockSetOpenTagsDialog}
      />
    );
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('muestra las etiquetas seleccionadas', () => {
    render(
      <TagsInput
        selectedTask={mockTask}
        setSelectedTags={mockSetSelectedTags}
        openTagsDialog={true}
        selectedTags={['tag1', 'tag2']}
        setOpenTagsDialog={mockSetOpenTagsDialog}
      />
    );
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });
});
