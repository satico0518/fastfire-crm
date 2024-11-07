export type Access = 'TYG'|'ADMIN'|'PURCHASE' 
export interface User {
    id?: string,
    key?: string,
    isActive: boolean,
    firstName: string;
    lastName: string;
    email: string;
    avatarURL?: string;
    color?: string;
    permissions: Access[];
    workgroupKeys: string[];
}