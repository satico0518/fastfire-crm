import { Status } from "./Shared";


export interface Note {
    text: string;
    createdByUserId: string;
    createdDate: Date;
}

export interface TaskEvent {
    originalStatus: Status;
    newStatus?: Status;
    originalName: string; 
    newName: string;
    originalOwnerKey: string; 
    newOwnerKey?: string;
    originalDueDate: Date;
    newDueDate?: Date;
    modifiedDate: number;
    modifierUserId: string;
}

export interface Task {
    [key: string]: unknown;
    id: string;
    key?: string;
    avatarURL?: string; 
    name: string;
    ownerKey?: string;
    history: TaskEvent[];
    createdDate: number;
    dueDate: Date;
    createdByUserKey: string;
    workgroupKey: string;
    tags: string[];
    status: Status;
    notes: Note[];
}