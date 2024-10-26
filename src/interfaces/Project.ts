import { Status } from "./Shared";


export interface Project {
    id: string;
    key?: string;
    name: string;
    createdDate: number;
    createdByUserId: string;
    status: Status;
    budget?: number;
    location: string;
    projectLeaderUserId?: string;
    collaboratorsIds?: string[];
}