export type Access = 'TYP'|'ADMIN'|'PURCHASE' 
export interface User {
    id?: string,
    key?: string,
    isActive: boolean,
    firstName: string;
    lastName: string;
    email: string;
    permissions: Access[];
}