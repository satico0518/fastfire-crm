export interface ProviderLicitation {
  providerKey: string;
  providerEmail: string;
  ranking: number;
  totalAmount: number;
  freeShipping: boolean;
  nightShipping: boolean;
  paymentDays: number;
  percentDiscount: number;
}
