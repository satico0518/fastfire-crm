import { db } from "../firebase/firebase.config";
import { push, ref, set, onValue, update, remove } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { MaintenanceSchedule } from "../interfaces/Maintenance";

export class MaintenanceService {
  private static TABLE_NAME = "maintenance_schedules";

  /**
   * Crea un nuevo agendamiento en Firebase
   */
  static async createSchedule(
    schedule: Omit<MaintenanceSchedule, "id">
  ): Promise<ServiceResponse & { id?: string }> {
    try {
      const schedulesRef = ref(db, this.TABLE_NAME);
      const newRef = push(schedulesRef);
      const id = newRef.key as string;

      const payload: MaintenanceSchedule = {
        ...schedule,
        id,
      };

      await set(newRef, payload);

      return {
        result: "OK",
        message: "Mantenimiento agendado exitosamente!",
        id,
      };
    } catch (error) {
      console.error("Error creando agendamiento:", error);
      return {
        result: "ERROR",
        errorMessage: "No se pudo guardar el agendamiento.",
      };
    }
  }

  /**
   * Escucha cambios en tiempo real de los agendamientos
   */
  static subscribeToSchedules(callback: (schedules: MaintenanceSchedule[]) => void) {
    const schedulesRef = ref(db, this.TABLE_NAME);
    
    // onValue returns an unsubscribe function directly in v9+
    const unsubscribe = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      const list: MaintenanceSchedule[] = Object.keys(data).map((key) => ({
        ...data[key],
        id: key, 
      }));

      callback(list);
    }, (error) => {
      console.error("Firebase Subscription Error:", error);
      callback([]); // Clear loading state even on error
    });

    return unsubscribe;
  }

  /**
   * Actualiza un agendamiento existente
   */
  static async updateSchedule(
    id: string,
    updates: Partial<MaintenanceSchedule>
  ): Promise<ServiceResponse> {
    try {
      const scheduleRef = ref(db, `${this.TABLE_NAME}/${id}`);
      await update(scheduleRef, updates);

      return {
        result: "OK",
        message: "Agendamiento actualizado correctamente.",
      };
    } catch (error) {
      console.error("Error actualizando agendamiento:", error);
      return {
        result: "ERROR",
        errorMessage: "No se pudo actualizar el agendamiento.",
      };
    }
  }

  /**
   * Elimina un agendamiento
   */
  static async deleteSchedule(id: string): Promise<ServiceResponse> {
    try {
      const scheduleRef = ref(db, `${this.TABLE_NAME}/${id}`);
      await remove(scheduleRef);

      return {
        result: "OK",
        message: "Agendamiento eliminado correctamente.",
      };
    } catch (error) {
      console.error("Error eliminando agendamiento:", error);
      return {
        result: "ERROR",
        errorMessage: "No se pudo eliminar el agendamiento.",
      };
    }
  }
}
