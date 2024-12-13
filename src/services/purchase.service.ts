import { db } from "../firebase/firebase.config";
import { push, ref, remove, set, update } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { Item, ItemExcel } from "../interfaces/Item";
import { ProviderLicitation } from "../interfaces/Licitation";

export class PurchaseService {
  static async addItemToStock(item: Item): Promise<ServiceResponse> {
    try {
      const itemRef = ref(db, "stock");
      const doc = push(itemRef);
      item.status = "ACTIVE";
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

  static async addStockFromExcel(data: ItemExcel[]): Promise<ServiceResponse> {
    try {
      const stock = data.map(
        (i) =>
          ({
            id: i.codigo,
            name: i.item.toUpperCase(),
            price: i.valor,
            showInTender: i.licitar === 's',
            count: i.cantidad,
            status: "ACTIVE",
          } as unknown as Item)
      );

      const itemRef = ref(db, "stock");
      await set(itemRef, stock);

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
      item.status = "INACTIVE";
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

  static async saveProviderLicitation(licitation: ProviderLicitation): Promise<ServiceResponse> {
    try {
      const itemRef = ref(db, `purchase/providers/${licitation.providerKey}`);
      await set(itemRef, licitation);

      return {
        result: 'OK',
        message: 'Licitación enviada exitosamente!'
      }
    } catch (error) {
      const errorMessage = `Error tratando de guardar licitacion del proveedor [${licitation.providerKey}]`;
      console.error(errorMessage, error);

      return {
        result: "ERROR",
        errorMessage,
      };
    }
  }
}
