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
    originalOwnerId: string; 
    newOwnerId?: string;
    originalDueDate: Date;
    newDueDate?: Date;
    modifiedDate: number;
    modifierUserId: string;
}

export interface Task {
    id: string;
    key?: string;
    avatarURL?: string; 
    name: string;
    ownerId: string;
    history: TaskEvent[];
    createdDate: number;
    dueDate: Date;
    createdByUserKey: string;
    projectId: string;
    tags: string[];
    status: Status;
    notes: Note[];
}