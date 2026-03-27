import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCreatorRowComponent } from '../TaskCreatorRowComponent';

// Mock minimal de los stores
jest.mock('../../../stores/tags/tags.store', () => ({
  useTagsStore: () => ({ tags: [] })
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: () => ({ users: [] })
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: () => ({ workgroups: [] })
}));

jest.mock('../../../stores/ui/ui.store', () => ({
  useUiStore: () => ({ setSnackbar: jest.fn() })
}));

jest.mock('../../../stores', () => ({
  useAuhtStore: () => ({
    user: {
      key: 'user1',
      permissions: ['USER'],
      workgroupKeys: ['wg1']
    }
  })
}));

describe('TaskCreatorRowComponent', () => {
  test('renderiza el componente sin errores', () => {
    render(<TaskCreatorRowComponent />);
    expect(document.body).toBeTruthy();
  });
});
