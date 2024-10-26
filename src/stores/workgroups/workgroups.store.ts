import { create } from "zustand";
import { Workgroup } from "../../interfaces/Workgroup";

interface WorkgroupState {
  workgroups: Workgroup[] | null;
  setWorkgroups: (workgroup: Workgroup[]) => void;
}

export const useWorkgroupStore = create<WorkgroupState>()((set) => ({
  workgroups: [],
  setWorkgroups: (workgroups: Workgroup[]) => set(() => ({ workgroups })),
}));
