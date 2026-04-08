import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebase/firebase.config";
import { Item } from "../../interfaces/Item";

interface StockState {
  stock: Item[];
  loadStock: () => void;
  setStock: (stock: Item[]) => void;
}

export const useStockStore = create<StockState>()(
  devtools((set) => ({
    stock: [],
    loadStock: async () => {
      try {
        const stockRef = ref(db, "stock");
        onValue(stockRef, (snapshot) => {
          const snapshotValue = snapshot.val();

          if (!snapshotValue || typeof snapshotValue !== "object") {
            set({ stock: [] });
            return;
          }

          const values: Item[] = Object.entries<Item>(snapshotValue as Item[]).map(
            ([key, value]) => ({ ...value, key })
          ) as Item[];
          set({ stock: values });
        });
      } catch (error) {
        console.error("Error cargando inventario desde store", { error });
      }
    },
    setStock: (stock: Item[]) => set(() => ({ stock })),
  }))
);

useStockStore.getState().loadStock();
