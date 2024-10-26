import { create } from "zustand";
import type { Task } from "../../interfaces/Task";

interface TasksState {
  tasks: Task[] | null;
  setTasks: (tasks: Task[]) => void;
  addTask?: (task: Task) => void;
  modifyTask?: (task: Task) => void;
  removeTask?: (taskId: string) => void;
}

export const useTasksStore = create<TasksState>()((set) => ({
    tasks: [],
    setTasks: (tasks: Task[]) => set(() => ({ tasks }))
}));
