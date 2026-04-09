import { get, push, ref, set, update } from "firebase/database";
import { db } from "../firebase/firebase.config";
import { Workgroup } from "../interfaces/Workgroup";
import { ServiceResponse } from "../interfaces/Shared";
import { v4 as uuidv4 } from "uuid";
import { Task } from "../interfaces/Task";
import { TaskService } from "./task.service";
import { User } from "../interfaces/User";
import { UsersService } from "./users.service";

export class WorkgroupService {
  static async createWorkgroup(
    wg: Workgroup,
    users: User[]
  ): Promise<ServiceResponse> {
    try {
      wg.id = uuidv4();
      const wgRef = ref(db, "workgroups");
      const wgDoc = push(wgRef);
      wg.key = wgDoc.key as string;

      for (const memberKey of wg.memberKeys) {
        const userRef = ref(db, `users/${memberKey}`);
        const user = users.filter((u) => u.key === memberKey)[0];
        user.workgroupKeys = [...user.workgroupKeys, wg.key];
        
        await update(userRef, user);
      }

      await set(wgDoc, wg);

      return {
        result: "OK",
        message: "Grupo de trabajo creado exitosamente!",
      };
    } catch (error) {
      console.error("Error al tratar de crear el grupo de trabajo.", { error });
      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error al tratar de crear el grupo de trabajo.",
      };
    }
  }

  static async getWorkgroups(): Promise<Workgroup[]> {
    try {
      const workgroupsRef = ref(db, "workgroups");
      const snapshot = await get(workgroupsRef);

      if (snapshot.exists()) {
        return Object.entries<Workgroup>(snapshot.val()).map(
          ([key, value]) => ({
            key,
            ...value,
          })
        ) as Workgroup[];
      }

      return [];
    } catch (error) {
      console.error("Error intentando obtener ciudades", { error });
      return [];
    }
  }

  static async modifyWorkgroup(workgroup: Workgroup, users: User[]): Promise<ServiceResponse> {
    try {
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);

      for (const memberKey of workgroup.memberKeys) {
        const workgroupKeysRef = ref(db, `users/${memberKey}/workgroupKeys`);
        const user = users.filter((u) => u.key === memberKey)[0];
        
        await set(workgroupKeysRef, [...user.workgroupKeys ?? [], workgroup.key]);
      }
      
      await update(workgroupRef, workgroup);

      return {
        result: "OK",
        message: "Grupo de trabajo modificado exitosamente!",
      };
    } catch (error) {
      console.error(
        `Error al intentar modificar el grupo de trabajo [key:${workgroup.key}]`,
        { error }
      );
      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error al intentar modificar el grupo de trabajo.",
      };
    }
  }

  static async deleteWorkgroup(
    workgroup: Workgroup,
    tasks: Task[],
    users: User[]
  ): Promise<ServiceResponse> {
    try {
      workgroup.isActive = false;
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);
      await update(workgroupRef, workgroup);

      // removing worgroup associated tasks
      const filteredTasks = tasks.filter(
        (t) => t.workgroupKey === workgroup.key
      );
      const taskResp = await TaskService.removeGroupTasks(filteredTasks);
      if (taskResp.result === "ERROR") return taskResp;

      // removing workgroup from users
      const filteredUsers = users.filter((t) =>
        t.workgroupKeys.includes(workgroup?.key as string)
      );
      const usersResp = await UsersService.removeGroupKeyFromUsers(
        filteredUsers,
        workgroup?.key as string
      );
      if (usersResp.result === "ERROR") return usersResp;

      return {
        result: "OK",
        message: "Grupo de trabajo y tareas eliminados exitosamente!",
      };
    } catch (error) {
      console.error(
        `Error al intentar eliminar el grupo de trabajo [key:${workgroup.key}]`,
        { error }
      );
      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error al intentar eliminar el grupo de trabajo.",
      };
    }
  }

  static async deleteMemberFromWorkgroup(
    workgroup: Workgroup,
    memberKey: string
  ): Promise<ServiceResponse> {
    try {
      workgroup.memberKeys = workgroup.memberKeys.filter(
        (mk) => mk !== memberKey
      );
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);
      await update(workgroupRef, workgroup);

      return {
        result: "OK",
        message: "Colaborador removido exitosamente!",
      };
    } catch (error) {
      console.error(
        `Error al intentar remover colaborador del grupo de trabajo [key:${workgroup.key}]`,
        { error }
      );
      return {
        result: "ERROR",
        message: null,
        errorMessage:
          "Error al intentar remover colaborador del grupo de trabajo.",
      };
    }
  }

  static async reactivateWorkgroup(workgroup: Workgroup): Promise<ServiceResponse> {
    try {
      const workgroupRef = ref(db, `workgroups/${workgroup.key}`);
      await update(workgroupRef, { isActive: true });

      return {
        result: "OK",
        message: "Grupo de trabajo reactivado exitosamente!",
      };
    } catch (error) {
      console.error(
        `Error al intentar reactivar el grupo de trabajo [key:${workgroup.key}]`,
        { error }
      );
      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error al intentar reactivar el grupo de trabajo.",
      };
    }
  }
}
