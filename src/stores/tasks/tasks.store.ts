import { create } from "zustand";
import type { Task } from "../../interfaces/Task";
import { devtools, persist } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface TasksState {
  tasks: Task[] | null;
  hasHydrated: boolean;
  loadTasks: () => void;
  setTasks: (tasks: Task[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    devtools((set) => ({
      tasks: [],
      hasHydrated: false,
      loadTasks: async () => {
        try {
          const tasksRef = ref(db, "tasks");
          onValue(tasksRef, (snapshot) => {
            const data = Object.values(snapshot.val()) as Task[] || [];
            
            if (data) {
              set({ tasks: data });
            } else set({ tasks: [] });
          });
        } catch (error) {
          console.error("Error cargando tareas desde store", { error });
          set({ tasks: [] });
        }
      },
      setTasks: (tasks: Task[]) => set(() => ({ tasks })),
      setHasHydrated: (hasHydrated: boolean) => set(() => ({ hasHydrated })),
    })), {
      name: 'tasks-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.loadTasks();
      },
    }
  )
);
