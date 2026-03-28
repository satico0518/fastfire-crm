import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";
import { FormatSubmission } from "../../interfaces/Format";

interface FormatsState {
  submissions: FormatSubmission[];
  loadSubmissions: () => void;
}

export const useFormatsStore = create<FormatsState>()(
  devtools((set) => ({
    submissions: [],
    loadSubmissions: () => {
      try {
        const submissionsRef = ref(db, "format_submissions");
        onValue(submissionsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const list = Object.values(data) as FormatSubmission[];
            // Sort by most recent first
            list.sort((a, b) => b.createdDate - a.createdDate);
            set({ submissions: list });
          } else {
            set({ submissions: [] });
          }
        });
      } catch (error) {
        console.error("Error cargando formatos", { error });
      }
    },
  }))
);

useFormatsStore.getState().loadSubmissions();
