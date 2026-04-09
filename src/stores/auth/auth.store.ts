import { create } from "zustand";
import { User } from "../../interfaces/User";
import { createJSONStorage, devtools, persist, StateStorage } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuth: boolean;
  token: string;
  hasHydrated: boolean;
  setToken: (token: string) => void;
  setNewUser: (user: User) => void;
  setIsAuth: (isAuth: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const customStorage: StateStorage = {
  getItem: function (name: string): string | null | Promise<string | null> {
    return localStorage.getItem(name);
  },
  setItem: function (name: string, value: string): void {
    localStorage.setItem(name, value);
  },
  removeItem: function (name: string): void {
    localStorage.removeItem(name);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools((set) => ({
      user: null,
      isAuth: false, // TODO DEJAR EN FALSE
      token: "",
      hasHydrated: false,
      setToken: (token: string) => set(() => ({ token })),
      setNewUser: (user: User) => {
        set(() => ({ user }));
      },
      setIsAuth: (isAuth: boolean) => set(() => ({ isAuth })),
      setHasHydrated: (hasHydrated: boolean) => set(() => ({ hasHydrated })),
    })), {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
