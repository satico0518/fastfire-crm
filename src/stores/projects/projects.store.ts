import { create } from "zustand";
import type { Project } from "../../interfaces/Project";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface ProjectsState {
  projects: Project[] | null;
  loadProjects: () => void;
  setProjects: (projects: Project[]) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  devtools((set) => ({
    projects: [],
    loadProjects: async () => {
      try {
        const projects = ref(db, "projects");
        onValue(projects, (snapshot) => {
          const data = Object.values(snapshot.val()) as Project[] | [];

          if (data) {
            set({ projects: data });
          } else {
            set({ projects: [] });
          }
        });
      } catch (error) {
        console.error("Error cargando propyectos desde store", { error });
      }
    },
    setProjects: (projects: Project[]) => set(() => ({ projects })),
  }))
);

useProjectsStore.getState().loadProjects();