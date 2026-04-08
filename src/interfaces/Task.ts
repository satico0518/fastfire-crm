import { Status } from "./Shared";

export interface Note {
    text: string;
    createdByUserId: string;
    createdDate: Date;
}

export type Priority = 'LOW'|'NORMAL'|'HIGH'|'URGENT';

export interface TaskEvent {
    action: 'CREATED' | 'UPDATED' | 'NOTE_ADDED';
    modifierUserId: string;
    modifiedDate: number;
    changes?: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
    note?: string;
}

export interface Task {
    [key: string]: unknown;
    id: string;
    key?: string;
    name: string;
    ownerKeys?: string[];
    priority: Priority;
    history: TaskEvent[];
    createdDate: number;
    dueDate: Date|string;
    createdByUserKey: string;
    workgroupKeys: string[];
    tags: string[];
    status: Status;
    notes: string;
    deletedDate?: number;
}