import { create } from "zustand";
import { User } from "../../interfaces/User";

interface UsersState {
  users: User[] | null;
  setUsers: (users: User[]) => void;
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  setUsers: (users: User[]) => set(() => ({ users })),
}));
