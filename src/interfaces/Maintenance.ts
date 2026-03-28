export interface MaintenanceSchedule {
  id: string;
  title: string; // Actividad principal
  dateStr: string; // ISO String (YYYY-MM-DD o full timestamp)
  address: string; // Ubicación
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string; // Detalle adicional / Actividad
  observations?: string; // Nuevo campo opcional
  contactName?: string;
  contactPhone?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  hasQuotation: 'SI' | 'NO' | 'NA';
  quotationNumber?: string;
  hasReport: 'SI' | 'NO' | 'NA';
  createdAt: string;
  createdBy: string;
}
