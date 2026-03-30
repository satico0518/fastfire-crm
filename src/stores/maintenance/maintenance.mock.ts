import { MaintenanceSchedule } from '../../interfaces/Maintenance';

export const mockSchedules: MaintenanceSchedule[] = [
  {
    id: "sched-101",
    title: "Mantenimiento Preventivo CC Santafé",
    dateStr: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Ayer
    address: "Calle 185 #45-03, Bogotá",
    status: "COMPLETED",
    description: "Revisión general de bombas y rociadores en sótanos 1 y 2.",
    contactName: "Julián Ruiz (Jefe Mantenimiento)",
    contactPhone: "3001234567",
    priority: "NORMAL",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    createdBy: "Davo Gomez (AdminFastFire)"
  },
  {
    id: "sched-102",
    title: "Ajuste de Presión Red Industrial",
    dateStr: new Date().toISOString(), // Hoy (hace un rato)
    address: "Autopista Medellín Km 2, Planta Pepsico",
    status: "IN_PROGRESS",
    description: "Fuga reportada en el múltiple principal. Se requiere ajuste de presión PSI.",
    contactName: "Ricardo Vargas",
    contactPhone: "3109876543",
    priority: "URGENT",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    createdBy: "Davo Gomez (AdminFastFire)"
  },
  {
    id: "sched-103",
    title: "Inspección Anual Rociadores",
    dateStr: new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString(), // Hoy (más tarde)
    address: "Torre empresarial Q",
    status: "SCHEDULED",
    description: "Prueba de hermeticidad a toda la tubería troncal.",
    contactName: "Luisa Fernández",
    contactPhone: "3124567890",
    priority: "NORMAL",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    createdBy: "Davo Gomez (AdminFastFire)"
  },
  {
    id: "sched-104",
    title: "Cambio de Panel Contra Incendios",
    dateStr: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Mañana
    address: "Edificio Horizonte, Cr 7 #100-20",
    status: "SCHEDULED",
    description: "Sustitución técnica del panel de alarmas y panel esclavo.",
    contactName: "Marta Gómez",
    contactPhone: "3154561234",
    priority: "HIGH",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    createdBy: "Sofia Ruiz (Operaciones)"
  },
  {
    id: "sched-105",
    title: "Mantenimiento Correctivo Sensores",
    dateStr: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Mañana
    address: "Clínica del Norte",
    status: "SCHEDULED",
    description: "Revisar sensores de humo en piso 4 que están marcando falsa alarma.",
    contactName: "Dr. Torres",
    contactPhone: "3187654321",
    priority: "URGENT",
    createdAt: new Date().toISOString(),
    createdBy: "Davo Gomez (AdminFastFire)"
  },
  {
    id: "sched-106",
    title: "Limpieza Cuarto de Bombas",
    dateStr: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // En 3 días
    address: "Conjunto Residencial La Floresta",
    status: "SCHEDULED",
    description: "Mantenimiento trimestral limpieza y purga.",
    contactName: "Administración",
    contactPhone: "3201112233",
    priority: "LOW",
    createdAt: new Date().toISOString(),
    createdBy: "Sofia Ruiz (Operaciones)"
  }
];
