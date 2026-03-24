import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface TagsState {
  tags: string[];
  loadTags: () => void;
  setTags: (tags: string[]) => void;
}

export const useTagsStore = create<TagsState>()(
  devtools((set) => ({
    tags: [],
    loadTags: async () => {
      try {
        const tagsRef = ref(db, "tags");
        onValue(tagsRef, (snapshot) => {
          const data = snapshot.val();

          if (data) {
            // Convertir el objeto de etiquetas a un array
            const tagsArray = Object.values(data) as string[];
            set({ tags: tagsArray });
          } else {
            set({ tags: [] });
          }
        });
      } catch (error) {
        console.error("Error cargando etiquetas desde store", { error });
      }
    },
    setTags: (tags: string[]) => set(() => ({ tags })),
  }))
);

useTagsStore.getState().loadTags();
