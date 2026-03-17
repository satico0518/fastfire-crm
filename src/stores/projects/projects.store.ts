import { create } from "zustand";
import type { Project } from "../../interfaces/Project";
import { devtools, persist } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface ProjectsState {
  projects: Project[] | null;
  hasHydrated: boolean;
  loadProjects: () => void;
  setProjects: (projects: Project[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    devtools((set) => ({
      projects: [],
      hasHydrated: false,
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
          console.error("Error cargando proyectos desde store", { error });
        }
      },
      setProjects: (projects: Project[]) => set(() => ({ projects })),
      setHasHydrated: (hasHydrated: boolean) => set(() => ({ hasHydrated })),
    })), {
      name: 'projects-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.loadProjects();
      },
    }
  )
);