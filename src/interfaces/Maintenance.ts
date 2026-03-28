export interface MaintenanceSchedule {
  id: string;
  title: string; 
  dateStr: string; 
  address: string; 
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string; 
  observations?: string; 
  contactName?: string;
  contactPhone?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  hasQuotation?: 'SI' | 'NO' | 'NA';
  quotationNumber?: string;
  hasReport?: 'SI' | 'NO' | 'NA';
  createdAt: string;
  createdBy: string;
}
