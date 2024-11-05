export interface Workgroup {
    id?: string,
    key?: string;
    isActive: boolean,
    isPrivate: boolean,
    name: string;
    description?: string;
    color: string;
    memberKeys: string[];
}