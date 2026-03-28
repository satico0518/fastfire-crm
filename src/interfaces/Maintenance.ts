export interface MaintenanceSchedule {
  id: string;
  title: string; // Actividad principal
  dateStr: string; // ISO String (YYYY-MM-DD o full timestamp)
  address: string; // Ubicación
  operatorNames: string[]; // Mock list of assigned technicians
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string; // Detalle adicional / Actividad
  observations?: string; // Nuevo campo opcional
  contactName?: string;
  contactPhone?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  createdBy: string;
}
