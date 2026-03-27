import { db } from "../firebase/firebase.config";
import { push, ref, remove, set, update, get } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { Task, TaskEvent } from "../interfaces/Task";
import { v4 as uuidv4 } from 'uuid';

export class TaskService {
  static async createTask(task: Task, creatorUserId?: string): Promise<ServiceResponse> {
    try {
      task.id = uuidv4();
      task.status = 'TODO';
      task.createdDate = Date.now();
      task.createdByUserKey = creatorUserId || task.createdByUserKey || 'system';

      const createdEvent: TaskEvent = {
        action: 'CREATED',
        modifierUserId: task.createdByUserKey,
        modifiedDate: Date.now(),
        changes: [
          { field: 'status', oldValue: null, newValue: task.status },
          { field: 'name', oldValue: null, newValue: task.name },
        ],
      };

      if (task.notes && task.notes.trim().length > 0) {
        createdEvent.note = task.notes;
      }

      task.history = [createdEvent];

      const tasksRef = ref(db, "tasks");
      const doc = push(tasksRef);
      task.key = doc.key as string;
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

  static async updateTask(task: Task, modifierUserId?: string): Promise<ServiceResponse> {
    try {
      const taskRef = ref(db, `tasks/${task.key}`);
      const snapshot = await get(taskRef);
      const previousTask = snapshot.val() as Task | null;

      if (!previousTask) {
        return { result: 'ERROR', message: null, errorMessage: 'Tarea no encontrada.' };
      }

      const delta: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

      const normalizeValue = (value: unknown): unknown =>
        value === undefined ? null : value;

      const fieldsToCheck: Array<keyof Task> = [
        'name',
        'status',
        'priority',
        'ownerKeys',
        'dueDate',
        'workgroupKeys',
        'tags',
      ];

      fieldsToCheck.forEach((field) => {
        const oldValue = normalizeValue(previousTask[field]);
        const newValue = normalizeValue(task[field]);
        const different = JSON.stringify(oldValue) !== JSON.stringify(newValue);

        if (different) {
          delta.push({ field: field as string, oldValue, newValue });
        }
      });

      let noteEvent: TaskEvent | undefined;

      const previousNotes = previousTask.notes || '';
      const currentNotes = task.notes || '';

      if (currentNotes !== previousNotes) {
        const noteAdded = currentNotes.replace(previousNotes, '').trim();
        const noteText = noteAdded.length ? noteAdded : currentNotes;

        noteEvent = {
          action: 'NOTE_ADDED',
          modifierUserId: modifierUserId || task.createdByUserKey || 'system',
          modifiedDate: Date.now(),
          note: noteText,
          changes: [{ field: 'notes', oldValue: previousNotes, newValue: currentNotes }],
        };
      }

      let stepEvent: TaskEvent | undefined;
      if (delta.length) {
        stepEvent = {
          action: 'UPDATED',
          modifierUserId: modifierUserId || task.createdByUserKey || 'system',
          modifiedDate: Date.now(),
          changes: delta,
        };
      }

      const history = previousTask.history || [];
      const eventsToAdd: TaskEvent[] = [];
      if (noteEvent) eventsToAdd.push(noteEvent);
      if (stepEvent) eventsToAdd.push(stepEvent);

      const newHistory = [...eventsToAdd, ...history].slice(0, 20);
      task.history = newHistory;

      const cleanValue = (value: any): any => {
        if (Array.isArray(value)) {
          return value.map((v) => cleanValue(v));
        }
        if (value && typeof value === 'object') {
          return Object.entries(value).reduce((acc, [k, v]) => {
            if (v !== undefined) acc[k] = cleanValue(v);
            return acc;
          }, {} as any);
        }
        return value === undefined ? null : value;
      };

      const updatePayload: Partial<Task> = {};
      Object.entries(task).forEach(([key, value]) => {
        if (value !== undefined) {
          updatePayload[key as keyof Task] = cleanValue(value);
        }
      });

      await update(taskRef, updatePayload);

      return {
        result: "OK",
        message: "Tarea editada exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar editar la tarea [key:${task.id}]`, { error });
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar editar la tarea.'
      };
    }
  }

  static async deleteTask(task: Task): Promise<ServiceResponse> {
    try {
      const tasksRef = ref(db, `tasks/${task.key}`);
      await remove(tasksRef);

      return {
        result: "OK",
        message: "Tarea eliminada exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar eliminar la tarea [key:${task.id}]`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar eliminar la tarea.'
      }
    }
  }

  static async removeGroupTasks (tasksToRemove: Task[]): Promise<ServiceResponse> {
    try {
      for (const task of tasksToRemove) {
        const tasksRef = ref(db, `tasks/${task.key}`);
        await remove(tasksRef);
      }
      
      return {
        result: "OK",
        message: "Tareas eliminadas exitosamente!",
      };
    } catch (error) {
      console.error(`Error al intentar eliminar las tareas del grupo.`, {error});
      return {
        result: 'ERROR',
        message: null,
        errorMessage: 'Error al intentar eliminar las tareas del grupo.'
      }
    }
  }
}
