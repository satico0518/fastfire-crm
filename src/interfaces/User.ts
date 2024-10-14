export interface User {
    name: string;
    email: string;
    role: 'ADMIN'|'OPERATOR';
    permissions: string[];
}