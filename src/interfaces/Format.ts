export type FormatStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "REJECTED";

export type FormatFieldType = "text" | "textarea" | "number" | "date" | "datetime" | "select" | "image" | "checkbox-group" | "signature" | "dynamic-group" | "calculated-sum";

export interface FormatField {
  name: string;
  label: string;
  type: FormatFieldType;
  required: boolean;
  options?: string[]; // for select and checkbox-group types
  placeholder?: string;
  minDateFromField?: string; // Name of another date/datetime field that acts as minimum date
  
  // Specific properties for "dynamic-group"
  subFields?: FormatField[]; 
  addLabel?: string; // Text for the "Add row" button, e.g. "+ Añadir compra"
  
  // Specific properties for "calculated-sum"
  calculateSum?: string; // Path of the array and field to sum, e.g. "compras.valor"
}

export type FormatTypeId =
  | "LEGALIZACION_CUENTAS"
  | "AVANCE_OBRA"
  | "ADICIONALES"
  | "ACTA_ENTREGA";

export interface FormatType {
  id: FormatTypeId;
  name: string;
  description: string;
  icon: string;
  fields: FormatField[];
}

export interface FormatSubmission {
  key?: string;
  formatTypeId: FormatTypeId;
  formatTypeName: string;
  status: FormatStatus;
  createdByUserKey: string;
  createdDate: number;
  updatedDate: number;
  reviewedByUserKey?: string;
  reviewedDate?: number;
  reviewNotes?: string;
  isPublicSubmission?: boolean;
  data: Record<string, unknown>;
}
