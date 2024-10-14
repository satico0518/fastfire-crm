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
    name: 'Davo Gomez',
    email: 'davo.gomez1@gmail.com',
    role: 'ADMIN',
    permissions: ['tasks']
  },
  // user: null,
  isAuth: false,
  setNewUser: (user: User) => set(() => ({ user })),
  setIsAuth: (isAuth: boolean) => set(() => ({ isAuth })),
}));
