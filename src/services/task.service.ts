import { db } from "../firebase/firebase.config";
import { push, ref, set, update } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { Task } from "../interfaces/Task";
import { v4 as uuidv4 } from 'uuid';

export class TaskService {
  static async createTask(task: Task): Promise<ServiceResponse> {
    try {
      task.id = uuidv4();
      task.status = 'TODO';
      task.createdDate = Date.now();
      const tasksRef = ref(db, "tasks");
      const doc = push(tasksRef);
      await set(doc, task);

      return {
        result: "OK",
        message: "Tarea creada exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de crear Tarea", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de crear Tarea",
      };
    }
  }

  static async updateTask(task: Task): Promise<ServiceResponse> {
    try {
      const tasksRef = ref(db, `tasks/${task.key}`);
      await update(tasksRef, task);

      return {
        result: "OK",
        message: "Tarea editada exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar editar la tarea [key:${task.id}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar editar la tarea.'
      }
    }
  }
}
