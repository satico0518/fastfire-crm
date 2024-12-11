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
          const data = Object.values(snapshot.val()) as Item[] || [];

          if (data) {
            set({ stock: data });
          } else set({ stock: [] });
        });
      } catch (error) {
        console.error("Error cargando inventario desde store", { error });
      }
    },
    setStock: (stock: Item[]) => set(() => ({ stock })),
  }))
);

useStockStore.getState().loadStock();
