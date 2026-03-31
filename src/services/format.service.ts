import { db } from "../firebase/firebase.config";
import { push, ref, set, update, query, orderByChild, equalTo, get } from "firebase/database";
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

  static async getPublicSubmissionsByFormat(formatTypeId: string): Promise<ServiceResponse & { data?: FormatSubmission[] }> {
    try {
      const submissionsRef = ref(db, "format_submissions");
      const q = query(submissionsRef, orderByChild("formatTypeId"), equalTo(formatTypeId));
      const snapshot = await get(q);

      if (!snapshot.exists()) {
        return {
          result: "OK",
          data: [],
        };
      }

      const submissions: FormatSubmission[] = [];
      snapshot.forEach((childSnapshot) => {
        const submission = childSnapshot.val() as FormatSubmission;
        // Only include public submissions
        if (submission.isPublicSubmission) {
          submissions.push({
            ...submission,
            key: childSnapshot.key as string,
          });
        }
      });

      // Sort by createdDate descending
      submissions.sort((a, b) => b.createdDate - a.createdDate);

      return {
        result: "OK",
        data: submissions,
      };
    } catch (error) {
      console.error("Error obteniendo envíos públicos", error);
      return {
        result: "ERROR",
        errorMessage: "Error al cargar los resultados públicos.",
      };
    }
  }

  static async createPublicAccessToken(submissionId: string, expiresInDays: number = 30): Promise<ServiceResponse & { token?: string }> {
    try {
      const token = crypto.randomUUID(); // Generate unique token
      const expiresAt = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);

      const tokenData = {
        submissionId,
        publicAccessToken: token,
        createdAt: Date.now(),
        expiresAt,
      };

      const tokensRef = ref(db, "format_public_access_tokens");
      await push(tokensRef, tokenData);

      return {
        result: "OK",
        token,
      };
    } catch (error) {
      console.error("Error creando token de acceso público", error);
      return {
        result: "ERROR",
        errorMessage: "Error al crear token de acceso.",
      };
    }
  }

  static async getSubmissionByPublicToken(token: string): Promise<ServiceResponse & { data?: FormatSubmission }> {
    try {
      const tokensRef = ref(db, "format_public_access_tokens");
      const q = query(tokensRef, orderByChild("publicAccessToken"), equalTo(token));
      const snapshot = await get(q);

      if (!snapshot.exists()) {
        return {
          result: "ERROR",
          errorMessage: "Token no encontrado o expirado.",
        };
      }

      let tokenData: any = null;
      snapshot.forEach((childSnapshot) => {
        tokenData = childSnapshot.val();
      });

      if (!tokenData || tokenData.expiresAt < Date.now()) {
        return {
          result: "ERROR",
          errorMessage: "Token expirado.",
        };
      }

      // Get the submission
      const submissionRef = ref(db, `format_submissions/${tokenData.submissionId}`);
      const submissionSnapshot = await get(submissionRef);

      if (!submissionSnapshot.exists()) {
        return {
          result: "ERROR",
          errorMessage: "Envío no encontrado.",
        };
      }

      const submission = submissionSnapshot.val() as FormatSubmission;
      submission.key = submissionSnapshot.key as string;

      return {
        result: "OK",
        data: submission,
      };
    } catch (error) {
      console.error("Error obteniendo envío por token público", error);
      return {
        result: "ERROR",
        errorMessage: "Error al acceder al envío.",
      };
    }
  }

  static async logPublicAccess(token: string, action: "VIEW_SUBMISSION" | "DOWNLOAD_PDF" | "DOWNLOAD_IMAGE"): Promise<void> {
    try {
      const logData = {
        publicAccessToken: token,
        action,
        timestamp: Date.now(),
        // Could add IP/userAgent if needed
      };

      const logsRef = ref(db, "format_public_access_logs");
      await push(logsRef, logData);
    } catch (error) {
      console.error("Error logging public access", error);
      // Don't throw, just log
    }
  }
}
