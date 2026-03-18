import { create } from "zustand";
import { User } from "../../interfaces/User";
import { devtools, persist } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface UsersState {
  users: User[] | null;
  hasHydrated: boolean;
  loadUsers: () => void;
  setUsers: (users: User[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    devtools((set) => ({
      users: [],
      hasHydrated: false,
      loadUsers: async () => {
        try {
          const usersRef = ref(db, "users");
          onValue(usersRef, (snapshot) => {
            const data = Object.values(snapshot.val()) as User[] || [];
    
            if (data) {
              set({users: data});
            } else set({users:[]});
          });
        } catch (error) {
          console.error("Error cargando usuarios.", { error });
          set({users:[]});
        }
      },
      setUsers: (users: User[]) => set(() => ({ users })),
      setHasHydrated: (hasHydrated: boolean) => set(() => ({ hasHydrated })),
    })), {
      name: 'users-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.loadUsers();
      },
    }
  )
);