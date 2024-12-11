export interface Item {
    [key:string]: unknown;
    id: string;
    key: string;
    name: string;
    price: number;
    showInTender: boolean;
    status: 'ACTIVE'|'INACTIVE';
    count: number;
}