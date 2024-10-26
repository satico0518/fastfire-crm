import { create } from "zustand";
import type { Project } from "../../interfaces/Project";

interface ProjectsState {
  projects: Project[] | null;
  setProjects: (projects: Project[]) => void;
}

export const useProjectsStore = create<ProjectsState>()((set) => ({
    projects: [],
    setProjects: (projects: Project[]) => set(() => ({ projects }))
}));
