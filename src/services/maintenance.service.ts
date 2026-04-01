import { db } from "../firebase/firebase.config";
import { push, ref, set, onValue, update, remove, get } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { MaintenanceSchedule, MaintenanceAuditEntry } from "../interfaces/Maintenance";

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

      // Filtrar campos undefined antes de guardar en Firebase
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      );

      await set(newRef, cleanPayload);

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
   * Actualiza un agendamiento existente y registra el histórico de cambios
   */
  static async updateSchedule(
    id: string,
    updates: Partial<MaintenanceSchedule>,
    changedBy: string
  ): Promise<ServiceResponse> {
    try {
      const scheduleRef = ref(db, `${this.TABLE_NAME}/${id}`);
      const snapshot = await get(scheduleRef);
      const currentSchedule = snapshot.val() as MaintenanceSchedule | null;

      if (!currentSchedule) {
        return {
          result: "ERROR",
          errorMessage: "El agendamiento no existe.",
        };
      }

      // Detecta qué cambió
      const changes: Record<string, { old: any; new: any }> = {};
      const fieldsToTrack = ['projectName', 'title', 'dateStr', 'address', 'status', 'description', 'observations', 'contactName', 'contactPhone', 'priority', 'hasQuotation', 'quotationNumber', 'hasReport', 'reportNumber'];
      
      fieldsToTrack.forEach(field => {
        const fieldKey = field as keyof MaintenanceSchedule;
        const newValue = updates[fieldKey];
        const currentValue = currentSchedule[fieldKey];
        
        // Solo registrar si el campo está siendo actualizado y hay un cambio real
        if (field in updates) {
          // Para campos opcionales, normalizar undefined a null para Firebase
          const normalizedOld = currentValue === undefined ? null : currentValue;
          const normalizedNew = newValue === undefined ? null : newValue;
          
          // Solo registrar si hay un cambio real
          if (normalizedOld !== normalizedNew) {
            changes[field] = {
              old: normalizedOld,
              new: normalizedNew,
            };
          }
        }
      });

      // Si no hay cambios, retorna directamente
      if (Object.keys(changes).length === 0) {
        return {
          result: "OK",
          message: "No hay cambios para registrar.",
        };
      }

      // Crea entrada de auditoría
      const auditEntry: MaintenanceAuditEntry = {
        timestamp: new Date().toISOString(),
        changedBy,
        changes,
      };

      // Actualiza el schedule con el histórico (filtrar undefined de updates)
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const updatedSchedule = {
        ...cleanUpdates,
        updatedAt: new Date().toISOString(),
        updatedBy: changedBy,
        editHistory: [...(currentSchedule.editHistory || []), auditEntry],
      };

      await update(scheduleRef, updatedSchedule);

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
