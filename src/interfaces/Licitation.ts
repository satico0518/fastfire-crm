export interface LicitationTable {
  id: string;
  item: string;
  precio: number;
}

export interface LicitationExcel {
  id: string;
  name: string;
  price: number;
}

export interface ProviderLicitation {
  licitationDate: number;
  providerKey: string;
  providerEmail: string;
  ranking: number;
  totalAmount: number;
  freeShipping: boolean;
  nightShipping: boolean;
  paymentDays: number;
  percentDiscount: number;
  licitation: LicitationExcel[];
}
