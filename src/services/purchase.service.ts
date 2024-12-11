import { db } from "../firebase/firebase.config";
import { push, ref, remove, set, update } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { Item } from "../interfaces/Item";

export class PurchaseService {
  static async addItemToStock(item: Item): Promise<ServiceResponse> {
    try {
      const itemRef = ref(db, "stock");
      const doc = push(itemRef);
      item.status = 'ACTIVE';
      item.key = doc.key as string;
      item.showInTender = true;
      await set(doc, item);

      return {
        result: "OK",
        message: "Item creado exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de crear el item", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de crear el item",
      };
    }
  }

  static async modifyItem(item: Item) {
    try {
      const itemRef = ref(db, `stock/${item.key}`);
      await update(itemRef, item);

      return {
        result: "OK",
        message: "Item modificado exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de modificar el item", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de modificar el item",
      };
    }
  }

  static async deleteItem(item: Item) {
    try {
      const itemRef = ref(db, `stock/${item.key}`);
      await remove(itemRef);

      return {
        result: "OK",
        message: "Item eliminado exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de eliminar el item", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de eliminar el item",
      };
    }
  }

  static async archiveItem(item: Item) {
    try {
      const itemRef = ref(db, `stock/${item.key}`);
      item.status = 'INACTIVE';
      await update(itemRef, item);

      return {
        result: "OK",
        message: "Item archivado exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de archivar el item", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de archivar el item",
      };
    }
  }
}
