import { create } from "zustand";
import { Tag } from "../../interfaces/Tag";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

interface TagsState {
  tags: Tag[];
  loadTags: () => void;
  setTags: (tags: Tag[]) => void;
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
            set({ tags: data });
          } else set({ tags: [] });
        });
      } catch (error) {
        console.error("Error cargando etiquetas desde store", { error });
      }
    },
    setTags: (tags: Tag[]) => set(() => ({ tags })),
  }))
);

useTagsStore.getState().loadTags();
