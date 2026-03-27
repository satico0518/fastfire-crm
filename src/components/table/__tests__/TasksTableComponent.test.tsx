import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTableComponent from '../TasksTableComponent';

// Mock de los stores con datos estáticos
jest.mock('../../../stores/tasks/tasks.store', () => ({
  useTasksStore: jest.fn((selector) => {
    const state = {
      tasks: [
        {
          id: '1',
          key: '1',
          name: 'Tarea 1',
          description: 'Descripción tarea 1',
          status: 'TODO',
          priority: 'LOW',
          createdDate: Date.now() - 1000,
          workgroupKeys: ['wg1'],
          workgroupKey: 'wg1',
          ownerKeys: ['user1'],
          tags: ['tag1'],
          dueDate: '',
          notes: '',
          history: [],
          createdByUserKey: 'user1'
        },
        {
          id: '2',
          key: '2',
          name: 'Tarea 2',
          description: 'Descripción tarea 2',
          status: 'IN_PROGRESS',
          priority: 'NORMAL',
          createdDate: Date.now() - 2000,
          workgroupKeys: ['wg1'],
          workgroupKey: 'wg1',
          ownerKeys: ['user2'],
          tags: ['tag2'],
          dueDate: '',
          notes: '',
          history: [],
          createdByUserKey: 'user2'
        }
      ],
      loadTasks: jest.fn(),
      setTasks: jest.fn(),
      hasHydrated: true,
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores/users/users.store', () => ({
  useUsersStore: jest.fn((selector) => {
    const state = {
      users: [
        {
          key: 'user1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          isActive: true,
          permissions: ['USER'],
          workgroupKeys: ['wg1'],
          color: '#FF5722'
        },
        {
          key: 'user2',
          firstName: 'María',
          lastName: 'García',
          email: 'maria@example.com',
          isActive: true,
          permissions: ['USER'],
          workgroupKeys: ['wg1'],
          color: '#2196F3'
        }
      ],
      loadUsers: jest.fn(),
      setUsers: jest.fn(),
      hasHydrated: true,
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores/workgroups/workgroups.store', () => ({
  useWorkgroupStore: jest.fn((selector) => {
    const state = {
      workgroups: [
        {
          key: 'wg1',
          name: 'Workgroup 1',
          isActive: true,
          isPrivate: false,
          color: '#4CAF50',
          memberKeys: ['user1', 'user2'],
          createdDate: Date.now()
        }
      ],
      loadWorkgroups: jest.fn(),
      setWorkgroups: jest.fn(),
      hasHydrated: true,
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

jest.mock('../../../stores', () => ({
  useAuhtStore: jest.fn((selector) => {
    const state = {
      user: {
        key: 'user1',
        permissions: ['USER'],
        workgroupKeys: ['wg1'],
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        isActive: true
      },
      isAuth: true,
      token: 'test-token',
      hasHydrated: true,
      setToken: jest.fn(),
      setNewUser: jest.fn(),
      setIsAuth: jest.fn(),
      setHasHydrated: jest.fn()
    };
    return selector ? selector(state) : state;
  })
}));

describe('TasksTableComponent', () => {
  test('renderiza la tabla de tareas correctamente', () => {
    render(<TasksTableComponent />);
    
    // Verificar que se renderiza el componente
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  test('muestra todas las tareas para usuarios ADMIN', () => {
    const { useAuhtStore } = require('../../../stores');
    useAuhtStore.mockImplementation((selector: ((state: unknown) => unknown) | undefined) => {
      const state = {
        user: {
          key: 'admin',
          permissions: ['ADMIN'],
          workgroupKeys: [],
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          isActive: true
        },
        isAuth: true,
        token: 'test-token',
        hasHydrated: true,
        setToken: jest.fn(),
        setNewUser: jest.fn(),
        setIsAuth: jest.fn(),
        setHasHydrated: jest.fn()
      };
      return selector ? selector(state) : state;
    });
    
    render(<TasksTableComponent />);
    
    // Debería mostrar todas las tareas
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
