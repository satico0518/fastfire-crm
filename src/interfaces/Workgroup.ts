export interface Workgroup {
    id?: string,
    key?: string;
    isActive: boolean,
    name: string;
    memberKeys: string[];
}