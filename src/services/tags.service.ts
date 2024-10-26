import { db } from "../firebase/firebase.config";
import { push, ref, set, update } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";

export class TagsService {
  static async createTag(tag: string): Promise<ServiceResponse> {
    try {
      const tagsRef = ref(db, '/tags');
      const doc = push(tagsRef);
      await set(doc, tag);
      
      return {
        result: "OK",
        message: "Etiqueta creada exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de crear Etiqueta", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de crear Etiqueta",
      };
    }
  }

  static async updateTags(tags: string[]): Promise<ServiceResponse> {
    try {
      const tagsRef = ref(db, `tags`);
      await update(tagsRef, tags);

      return {
        result: "OK",
        message: "Etiqueta creada exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar editar la Etiqueta.`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar editar la Etiqueta.'
      }
    }
  }
}
