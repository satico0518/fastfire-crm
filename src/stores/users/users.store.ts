import { create } from "zustand";
import { User } from "../../interfaces/User";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface UsersState {
  users: User[] | null;
  loadUsers: () => void;
  setUsers: (users: User[]) => void;
}

export const useUsersStore = create<UsersState>()(
  devtools((set) => ({
    users: [],
    loadUsers: async () => {
      try {
        const usersRef = ref(db, "users");
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
  
          if (data) {
            const values: User[] = Object.entries<User>(data).map(
              ([key, value]) => ({ ...value, key })
            ) as User[];
  
            set({users: values});
          } else set({users:[]});
        });
      } catch (error) {
        console.error("Error cargando usuarios.", { error });
        set({users:[]});
      }
    },
    setUsers: (users: User[]) => set(() => ({ users })),
  }))
);

useUsersStore.getState().loadUsers()