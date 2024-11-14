import { db } from "../firebase/firebase.config";
import { push, ref, remove, set, update } from "firebase/database";
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
        errorMessage: 'Error al intentar editar la Etiqueta.'
      }
    }
  }

  static async deleteTagByKey(key: string): Promise<ServiceResponse> {
    try {
      const tagRef = ref(db, `tags/${key}`);
      await remove(tagRef);
      return {
        result: "OK",
        message: "Etiqueta eliminada exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar eliminar la etiqueta.`, {error});
      return {
        result: 'ERROR',
        errorMessage: 'Error al intentar eliminar la etiqueta.'
      }
    }
  }
}
