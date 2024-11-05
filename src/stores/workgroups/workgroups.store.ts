import { create } from "zustand";
import { Workgroup } from "../../interfaces/Workgroup";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface WorkgroupState {
  workgroups: Workgroup[] | null;
  loadWorkgroups: () => void;
  setWorkgroups: (workgroup: Workgroup[]) => void;
}

export const useWorkgroupStore = create<WorkgroupState>()(
  devtools((set) => ({
    workgroups: [],
    loadWorkgroups: async () => {
      try {
        const usersRef = ref(db, "workgroups");
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();

          if (data) {
            const values: Workgroup[] = Object.entries<Workgroup>(data).map(
              ([key, value]) => ({ ...value, key })
            ) as Workgroup[];

            set({ workgroups: values });
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
  }))
);

useWorkgroupStore.getState().loadWorkgroups();
