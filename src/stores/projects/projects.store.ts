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
          const data = snapshot.val();

          if (data) {
            const values: Project[] = Object.entries<Project>(data).map(
              ([key, value]) => ({ ...value, key })
            ) as Project[];

            set({
              projects: values.filter(
                (project) => project.status !== "DELETED"
              ) as unknown as Project[],
            });
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