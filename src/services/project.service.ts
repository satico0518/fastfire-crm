import { auth, db } from "../firebase/firebase.config";
import { push, ref, set, update } from "firebase/database";
import { Project } from "../interfaces/Project";
import { ServiceResponse } from "../interfaces/Shared";
import { v4 as uuidv4 } from 'uuid';

export class ProjectService {
  static async createProject(project: Project): Promise<ServiceResponse> {
    try {
      project.id = uuidv4();
      project.createdDate = Date.now();
      project.status = "TODO";
      project.createdByUserId = auth.currentUser?.uid || "NoCurrentUserId";

      const projectRef = ref(db, "projects");
      const doc = push(projectRef);
      await set(doc, project);
      return {
        result: "OK",
        message: "Proyecto creado exitosamente!",
      };
    } catch (error) {
      console.error("Error tratando de crear Proyecto", error);

      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error tratando de crear Proyecto",
      };
    }
  }

  static async deleteProject(projectKey: string): Promise<ServiceResponse> {
    try {
      const projectRef = ref(db, `projects/${projectKey}`);
      await update(projectRef, {status: 'DELETED'});

      return {
        result: "OK",
        message: "Proyecto eliminado exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar eliminar el proyecto [key:${projectKey}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar eliminar el proyecto.'
      }
    }
  }

  static async updateProject(project: Project): Promise<ServiceResponse> {
    try {
      const projectRef = ref(db, `projects/${project.key}`);
      await update(projectRef, project);

      return {
        result: "OK",
        message: "Proyecto editado exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar editar el proyecto [key:${project.id}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar editar el proyecto.'
      }
    }
  }
}
