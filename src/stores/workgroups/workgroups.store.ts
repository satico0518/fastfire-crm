import { create } from "zustand";
import { Workgroup } from "../../interfaces/Workgroup";
import { devtools, persist } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface WorkgroupState {
  workgroups: Workgroup[] | null;
  hasHydrated: boolean;
  loadWorkgroups: () => void;
  setWorkgroups: (workgroup: Workgroup[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useWorkgroupStore = create<WorkgroupState>()(
  persist(
    devtools((set) => ({
      workgroups: [],
      hasHydrated: false,
      loadWorkgroups: async () => {
        try {
          const usersRef = ref(db, "workgroups");
          onValue(usersRef, (snapshot) => {
            const data = Object.values(snapshot.val()) as Workgroup[] || [];

            if (data) {
              set({ workgroups: data });
            } else set({ workgroups: [] });
          });
        } catch (error) {
          console.error("Error al intentar cargar los grupos de trabajo. ", {
            error,
          });
          set({ workgroups: [] });
        }
      },
      setWorkgroups: (workgroups: Workgroup[]) => set(() => ({ workgroups })),
      setHasHydrated: (hasHydrated: boolean) => set(() => ({ hasHydrated })),
    })), {
      name: 'workgroups-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.loadWorkgroups();
      },
    }
  )
);
