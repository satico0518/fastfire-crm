import { get, push, ref, set, update } from "firebase/database";
import { db } from "../firebase/firebase.config";
import { Workgroup } from "../interfaces/Workgroup";
import { ServiceResponse } from "../interfaces/Shared";
import { v4 as uuidv4 } from 'uuid';

export class WorkgroupService {
  static async createWorkgroup(wg: Workgroup): Promise<ServiceResponse> {
    try {
      wg.id = uuidv4();      
      const wgRef = ref(db, "workgroups");
      const wgDoc = push(wgRef);
      await set(wgDoc, wg);

      return {
        result: 'OK',
        message: 'Grupo de trabajo creado exitosamente!'
      }
    } catch (error) {
      console.error('Error al tratar de crear el grupo de trabajo.', {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al tratar de crear el grupo de trabajo.',
      }
    }
  }

  static async getWorkgroups(): Promise<Workgroup[]> {
    try {
      const workgroupsRef = ref(db, "workgroups");
      const snapshot = await get(workgroupsRef);

      if (snapshot.exists()) {
        return Object.entries<Workgroup>(snapshot.val()).map(([key, value]) => ({
          key,
          ...value,
        })) as Workgroup[];
      }

      return [];
    } catch (error) {
      console.error("Error intentando obtener ciudades", {error});
      return []
    }
  }

  static async modifyWorkgroup(workgroup: Workgroup): Promise<ServiceResponse> {
    try {
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);
      await update(workgroupRef, workgroup);

      return {
        result: "OK",
        message: "Grupo de trabajo modificado exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar modificar el grupo de trabajo [key:${workgroup.key}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar modificar el grupo de trabajo.'
      }
    }
  }

  static async deleteWorkgroup(workgroup: Workgroup): Promise<ServiceResponse> {
    try {
      workgroup.isActive = false;
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);
      await update(workgroupRef, workgroup);

      return {
        result: "OK",
        message: "Grupo de trabajo eliminado exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar eliminar el grupo de trabajo [key:${workgroup.key}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar eliminar el grupo de trabajo.'
      }
    }
  }

  static async deleteMemberFromWorkgroup(workgroup: Workgroup, memberKey: string): Promise<ServiceResponse> {
    try {
      workgroup.memberKeys = workgroup.memberKeys.filter(mk => mk !== memberKey);
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);
      await update(workgroupRef, workgroup);

      return {
        result: "OK",
        message: "Colaborador removido exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar remover colaborador del grupo de trabajo [key:${workgroup.key}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar remover colaborador del grupo de trabajo.'
      }
    }
  }
}
