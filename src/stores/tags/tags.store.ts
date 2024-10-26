import { create } from "zustand";
import { Tag } from "../../interfaces/Tag";

interface TagsState {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

export const useTagsStore = create<TagsState>()((set) => ({
    tags: [],
    setTags: (tags: Tag[]) => set(() => ({ tags }))
}));
