import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";

let unsubscribeTagsListener: (() => void) | null = null;

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
        if (unsubscribeTagsListener) {
          unsubscribeTagsListener();
        }

        const tagsRef = ref(db, "tags");
        unsubscribeTagsListener = onValue(
          tagsRef,
          (snapshot) => {
            const data = snapshot.val();

            if (data) {
              const tagsArray = Object.values(data).filter(
                (tag): tag is string => typeof tag === "string"
              );
              set({ tags: tagsArray });
            } else {
              set({ tags: [] });
            }
          },
          (error) => {
            console.error("Error cargando etiquetas desde Firebase", { error });
            set({ tags: [] });
          }
        );
      } catch (error) {
        console.error("Error cargando etiquetas desde store", { error });
      }
    },
    setTags: (tags: string[]) => set(() => ({ tags })),
  }))
);

useTagsStore.getState().loadTags();
