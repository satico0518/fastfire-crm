import { FormatType } from "../interfaces/Format";

/**
 * Catálogo de formatos hardcodeados.
 * Para agregar un nuevo formato, simplemente se agrega un nuevo objeto a este array.
 */
export const FORMAT_CATALOG: FormatType[] = [
  {
    id: "LEGALIZACION_CUENTAS",
    name: "Legalización de Cuentas",
    description: "Flujo de gastos, viáticos o compras con comprobantes.",
    icon: "receipt_long",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Tu nombre" },
      { name: "apellido", label: "Apellido", type: "text", required: true, placeholder: "Tu apellido" },
      { name: "proyecto", label: "Proyecto", type: "text", required: true, placeholder: "Ej: VELEZ TESORO" },
      {
        name: "compras",
        label: "Compras a Legalizar",
        type: "dynamic-group",
        required: true,
        addLabel: "+ Añadir Compra",
        subFields: [
          { name: "fecha_compra", label: "Fecha de Compra", type: "date", required: true },
          { name: "valor", label: "Valor de Compra (COP)", type: "number", required: true, placeholder: "Ej. 150000" },
          { name: "detalle", label: "Detalle", type: "textarea", required: true, placeholder: "Ej: Materiales ferretería" },
          { name: "foto", label: "Foto Comprobante", type: "image", required: false },
        ],
      },
      {
        name: "total_legalizacion",
        label: "Total Legalización",
        type: "calculated-sum",
        required: false,
        calculateSum: "compras.valor",
      },
    ],
  },
  {
    id: "AVANCE_OBRA",
    name: "Avance de Obra",
    description: "Reporte del porcentaje de avance y estado de obra.",
    icon: "engineering",
    fields: [
      { name: "proyecto", label: "Proyecto", type: "text", required: true, placeholder: "Nombre del proyecto" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "elaborado_por", label: "Elaborado Por", type: "text", required: true, placeholder: "Nombre completo" },
      { name: "detalle_actividad", label: "Detalle de Actividad", type: "textarea", required: true, placeholder: "Describe la actividad realizada..." },
      { name: "registro_fotografico", label: "Registro Fotográfico", type: "image", required: true },
      { name: "firma", label: "Firma", type: "signature", required: true },
    ],
  },
  {
    id: "ADICIONALES",
    name: "Adicionales",
    description: "Registro de trabajos adicionales fuera del alcance original.",
    icon: "add_circle",
    fields: [
      { name: "proyecto", label: "Proyecto", type: "text", required: true, placeholder: "Nombre del proyecto" },
      { name: "fecha_solicitud", label: "Fecha de Solicitud", type: "date", required: true },
      { name: "nombre_oficial_encargado", label: "Nombre Oficial Encargado", type: "text", required: true, placeholder: "Nombre completo" },
      { name: "actividad_adicional", label: "Actividad Adicional Solicitada", type: "textarea", required: true, placeholder: "Describe la actividad adicional..." },
      { name: "motivo_actividad", label: "Motivo de la Actividad", type: "textarea", required: true, placeholder: "Justificación o motivo" },
      { name: "nombre_quien_autoriza", label: "Nombre de Quien Autoriza", type: "text", required: true, placeholder: "Nombre de quien autoriza" },
      { name: "firma_autoriza", label: "Firma de Quien Autoriza", type: "signature", required: true },
    ],
  },
  {
    id: "ACTA_ENTREGA",
    name: "Acta de Entrega y Pruebas",
    description: "Documento formal de entrega y pruebas de obra finalizada.",
    icon: "assignment_turned_in",
    fields: [
      { name: "proyecto", label: "Proyecto", type: "text", required: true, placeholder: "Nombre del proyecto" },
      { name: "elaborado_por", label: "Elaborado Por", type: "text", required: true, placeholder: "Nombre completo" },
      { name: "fecha_hora_inicio", label: "Fecha y Hora de Inicio", type: "datetime", required: true },
      { name: "psi_inicial", label: "PSI Inicial", type: "number", required: true, placeholder: "0" },
      { name: "foto_manometro_inicial", label: "Foto Manómetro Inicial", type: "image", required: true },
      { name: "fecha_hora_finalizacion", label: "Fecha y Hora de Finalización", type: "datetime", required: true, minDateFromField: "fecha_hora_inicio" },
      { name: "psi_final", label: "PSI Final", type: "number", required: true, placeholder: "0" },
      { name: "foto_manometro_final", label: "Foto Manómetro Final", type: "image", required: true },
      { name: "cantidad_puntos_instalados", label: "Cantidad de Puntos Instalados", type: "number", required: false, placeholder: "0" },
      { name: "adicionales_supresion", label: "Adicionales (Mangueras, Modificaciones...)", type: "textarea", required: false, placeholder: "Describir adicionales de supresión" },
      { name: "cantidad_sensores_instalados", label: "Cantidad de Sensores Instalados", type: "number", required: false, placeholder: "0" },
      { name: "adicionales_deteccion", label: "Adicionales Detección (Modificaciones)", type: "textarea", required: false, placeholder: "Describir adicionales de detección" },
      {
        name: "elementos_instalados_deteccion",
        label: "Elementos Instalados Detección",
        type: "checkbox-group",
        required: false,
        options: ["Panel de control", "Estación manual con sirena", "Módulo"],
      },
      { name: "observaciones", label: "Observaciones", type: "textarea", required: false, placeholder: "Notas adicionales" },
      { name: "recibido_por", label: "Recibido Por", type: "text", required: true, placeholder: "Nombre de quien recibe" },
      { name: "firma_recibido", label: "Firma Recibido", type: "signature", required: true },
    ],
  },
  {
    id: "ACTA_VISITA_MANTENIMIENTO",
    name: "Acta de Visita Mantenimiento",
    description: "Formulario para inspección y mantenimiento del sistema de red contra incendio.",
    icon: "assignment",
    fields: [
      {
        name: "info_general",
        label: "Información General",
        type: "section",
        required: false,
        subFields: [
          { name: "fecha", label: "Fecha", type: "date", required: true },
          { name: "cliente", label: "Cliente", type: "text", required: true, placeholder: "Nombre del cliente" },
          { name: "proyecto_tienda", label: "Proyecto o Tienda", type: "text", required: true, placeholder: "Nombre del proyecto o tienda" },
          { name: "ciudad", label: "Ciudad", type: "text", required: true, placeholder: "Ciudad" },
          { name: "direccion", label: "Dirección", type: "text", required: true, placeholder: "Dirección" },
        ],
      },

      // Inspección visual de alimentación al local
      {
        name: "inspeccion_alimentacion",
        label: "Inspección visual de alimentación al local",
        type: "section",
        required: false,
        subFields: [
          
        ],
      },

    ],
  },
];

export const getFormatTypeById = (id: string): FormatType | undefined =>
  FORMAT_CATALOG.find((f) => f.id === id);
