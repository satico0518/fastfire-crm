import { db } from "../firebase/firebase.config";
import { push, ref, set, update } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { FormatSubmission } from "../interfaces/Format";

export class FormatService {
  static async createSubmission(
    submission: Omit<FormatSubmission, "key">
  ): Promise<ServiceResponse & { key?: string }> {
    try {
      const submissionsRef = ref(db, "format_submissions");
      const docRef = push(submissionsRef);
      const key = docRef.key as string;

      const payload: FormatSubmission = {
        ...submission,
        key,
        createdDate: Date.now(),
        updatedDate: Date.now(),
      };

      await set(docRef, payload);

      return {
        result: "OK",
        message: "Formato guardado exitosamente!",
        key,
      };
    } catch (error) {
      console.error("Error creando formato", error);
      return {
        result: "ERROR",
        errorMessage: "Error al guardar el formato.",
      };
    }
  }

  static async updateSubmission(
    submission: FormatSubmission
  ): Promise<ServiceResponse> {
    try {
      if (!submission.key) throw new Error("Missing key");
      const docRef = ref(db, `format_submissions/${submission.key}`);
      await update(docRef, {
        ...submission,
        updatedDate: Date.now(),
      });

      return {
        result: "OK",
        message: "Formato actualizado exitosamente!",
      };
    } catch (error) {
      console.error("Error actualizando formato", error);
      return {
        result: "ERROR",
        errorMessage: "Error al actualizar el formato.",
      };
    }
  }

  static async reviewSubmission(
    key: string,
    status: "REVIEWED" | "REJECTED",
    reviewedByUserKey: string,
    reviewNotes?: string
  ): Promise<ServiceResponse> {
    try {
      const docRef = ref(db, `format_submissions/${key}`);
      await update(docRef, {
        status,
        reviewedByUserKey,
        reviewedDate: Date.now(),
        reviewNotes: reviewNotes || null,
      });

      return {
        result: "OK",
        message:
          status === "REVIEWED"
            ? "Formato aprobado!"
            : "Formato rechazado.",
      };
    } catch (error) {
      console.error("Error revisando formato", error);
      return {
        result: "ERROR",
        errorMessage: "Error al revisar el formato.",
      };
    }
  }
}
