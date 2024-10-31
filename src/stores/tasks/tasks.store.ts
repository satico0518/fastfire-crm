import { create } from "zustand";
import type { Task } from "../../interfaces/Task";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface TasksState {
  tasks: Task[] | null;
  loadTasks: () => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTasksStore = create<TasksState>()(
  devtools((set) => ({
    tasks: [],
    loadTasks: async () => {
      try {
        const tasksRef = ref(db, "tasks");
        onValue(tasksRef, (snapshot) => {
          const data = snapshot.val();

          if (data) {
            const values = Object.entries<Task>(data).map(([key, value]) => ({
              ...value,
              key,
            }));
            set({ tasks: values });
          } else set({ tasks: [] });
        });
      } catch (error) {
        console.error('Error cargando tareas desde store', {error});
        set({ tasks: [] });
      }
    },
    setTasks: (tasks: Task[]) => set(() => ({ tasks })),
  }))
);

useTasksStore.getState().loadTasks();