import { create } from "zustand";
import { User } from "../../interfaces/User";

interface AuthState {
  user: User | null;
  isAuth: boolean;
  setNewUser: (user: User) => void;
  setIsAuth: (isAuth: boolean) => void;
}

export const useAuhtStore = create<AuthState>()((set) => ({
  user: {
    id: '123',
    key: 'abc',
    isActive: true,
    firstName: 'Davo',
    lastName: 'Gomez',
    email: 'davo.gomez1@gmail.com',
    permissions: ['ADMIN', 'TYP', 'PURCHASE']
  },
  // user: null,
  isAuth: true, // TODO DEJAR EN FALSE
  setNewUser: (user: User) => set(() => ({ user })),
  setIsAuth: (isAuth: boolean) => set(() => ({ isAuth })),
}));
