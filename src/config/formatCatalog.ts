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
    id: "REPORTE_MANTENIMIENTO",
    name: "Reporte de Mantenimiento",
    description: "Documento para reportar trabajos de mantenimiento realizados.",
    icon: "build",
    fields: [
      { name: "proyecto", label: "Proyecto", type: "text", required: true, placeholder: "Nombre del proyecto" },
      { name: "fecha_mantenimiento", label: "Fecha de Mantenimiento", type: "date", required: true },
      { name: "tecnico_responsable", label: "Técnico Responsable", type: "text", required: true, placeholder: "Nombre completo del técnico" },
      { name: "tipo_mantenimiento", label: "Tipo de Mantenimiento", type: "select", required: true, options: ["Preventivo", "Correctivo", "Predictivo"] },
      { name: "descripcion_trabajo", label: "Descripción del Trabajo Realizado", type: "textarea", required: true, placeholder: "Describir detalladamente el trabajo realizado..." },
      { name: "componentes_revisados", label: "Componentes Revisados", type: "checkbox-group", required: false, options: ["Sistema de supresión", "Sistema de detección", "Panel de control", "Mangueras", "Sensores", "Válvulas"] },
      {
        name: "repuestos_utilizados",
        label: "Repuestos Utilizados",
        type: "dynamic-group",
        required: false,
        addLabel: "+ Añadir Repuesto",
        subFields: [
          { name: "descripcion_repuesto", label: "Descripción del Repuesto", type: "text", required: true },
          { name: "cantidad", label: "Cantidad", type: "number", required: true, placeholder: "1" },
          { name: "foto_repuesto", label: "Foto del Repuesto", type: "image", required: false },
        ],
      },
      { name: "tiempo_ejecucion", label: "Tiempo de Ejecución (horas)", type: "number", required: true, placeholder: "2.5" },
      { name: "observaciones", label: "Observaciones", type: "textarea", required: false, placeholder: "Observaciones adicionales..." },
      { name: "firma_tecnico", label: "Firma del Técnico", type: "signature", required: true },
      { name: "firma_supervisor", label: "Firma del Supervisor", type: "signature", required: false },
    ],
  },
  {
    id: "ACTA_VISITA_MANTENIMIENTO",
    name: "Acta de Visita Mantenimiento",
    description: "Formulario para inspección y mantenimiento del sistema de red contra incendio.",
    icon: "assignment",
    fields: [
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "cliente", label: "Cliente", type: "text", required: true, placeholder: "Nombre del cliente" },
      { name: "proyecto_tienda", label: "Proyecto o Tienda", type: "text", required: true, placeholder: "Nombre del proyecto o tienda" },
      { name: "ciudad", label: "Ciudad", type: "text", required: true, placeholder: "Ciudad" },
      { name: "direccion", label: "Dirección", type: "text", required: true, placeholder: "Dirección" },

      // Inspección visual de alimentación al local
      { name: "valvula_monitoreada", label: "El local cuenta con válvula monitoreada", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "valvula_zona_comun", label: "La válvula se encuentra en zona común", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "propietario_responsable", label: "El propietario del local es responsable del suministro de agua", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "valvula_entrada_abierta", label: "La válvula de alimentación está abierta", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "valvula_control_accesible", label: "Las válvulas de control son accesibles para inspección y uso en emergencia", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "local_con_drenaje", label: "El local cuenta con drenaje", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "observaciones_alimentacion", label: "Observaciones alimentación", type: "textarea", required: false },

      // Inspección visual rociadores
      { name: "rociadores_libres_fugas", label: "Los rociadores aparecen libres de fugas", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "rociadores_libres_corrosion", label: "Los rociadores aparecen libres de corrosión", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "rociadores_perdidas_fluido", label: "Los rociadores presentan pérdidas de fluido en el elemento sensible", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "rociadores_carga_perjudicial", label: "Los rociadores presentan carga que perjudique el desempeño", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "rociadores_pintura_extrania", label: "Los rociadores aparecen con pintura no aplicada por el fabricante", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "rociadores_posicionados", label: "Los rociadores aparecen debidamente posicionados", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "rociadores_espaciados", label: "Los rociadores aparecen debidamente espaciados", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tipo_rociadores", label: "Tipo de rociadores existentes y cantidad", type: "textarea", required: false, placeholder: "Describir tipo y cantidad" },

      // Inspección visual tubería.
      { name: "soportes_tuberia_flojos", label: "Los soportes de la tubería están flojos o desprendidos", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tuberias_danadas", label: "Existen tuberías dañadas", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "dispositivos_soporte_danados", label: "Hay dispositivos de soporte dañados o no existen", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "soportes_antisismicos", label: "Hay soportes antisísmicos", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tuberia_libre_fugas", label: "La tubería aparece libre de fugas", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tuberia_libre_corrosion", label: "La tubería aparece libre de corrosión", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tuberia_libre_cargas_externas", label: "La tubería aparece libre de cargas externas", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tuberia_libre_filtracion", label: "Tubería libre de filtración", type: "select", required: true, options: ["SI", "NO", "NA"] },
      { name: "tuberia_alineada", label: "La tubería aparece debidamente alineada", type: "select", required: true, options: ["SI", "NO", "NA"] },

      // Inspección extintores
      { name: "extintores_total", label: "Cuántos extintores existen en total", type: "number", required: true, placeholder: "Ej: 10" },
      { name: "extintores_tipo_a", label: "Extintores Tipo A por capacidad en libras (2,5,10,20,30)", type: "text", required: false, placeholder: "2=0,5=2,10=1..." },
      { name: "extintores_tipo_b", label: "Extintores Tipo B por capacidad en libras (5,10,15,20,50)", type: "text", required: false, placeholder: "5=1,10=0,15=2..." },
      { name: "extintores_otro_tipo", label: "Otro tipo de extintores", type: "text", required: false },
      { name: "fecha_vencimiento_extintores", label: "Fecha de vencimiento de extintores", type: "date", required: false },

      // Inspección detección
      { name: "deteccion_sistema", label: "Cuentan con sistema de detección", type: "select", required: true, options: ["SI", "NO"] },
      { name: "deteccion_panel_propio", label: "Cuentan con panel de control propio", type: "select", required: true, options: ["SI", "NO"] },
      { name: "voltaje_baterias_panel", label: "Voltaje de baterías del panel", type: "text", required: false, placeholder: "Ej: 12V" },
      { name: "detectores_instalados", label: "Cuántos detectores instalados", type: "number", required: false },
      { name: "tipo_detectores", label: "Tipo de detectores y marca", type: "text", required: false },
      { name: "estaciones_manuales", label: "Tiene estaciones manuales y cuántas", type: "text", required: false },
      { name: "luces_estrobos", label: "Tiene luces de estrobo y cuántas", type: "text", required: false },

      { name: "descripcion_generar_inspeccion", label: "Descripción general de la inspección", type: "textarea", required: false, placeholder: "Descripción detallada..." },
      { name: "recomendaciones", label: "Recomendaciones", type: "textarea", required: false, placeholder: "Recomendaciones..." },

      { name: "firma_cliente_nombre", label: "Nombre funcionario cliente", type: "text", required: false },
      { name: "firma_cliente_cedula", label: "Cédula funcionario cliente", type: "text", required: false },
      { name: "firma_cliente_cargo", label: "Cargo funcionario cliente", type: "text", required: false },
      { name: "firma_cliente", label: "Firma funcionario cliente", type: "signature", required: false },
      { name: "firma_fastfire_nombre", label: "Nombre funcionario Fast Fire", type: "text", required: false },
      { name: "firma_fastfire_cedula", label: "Cédula funcionario Fast Fire", type: "text", required: false },
      { name: "firma_fastfire_cargo", label: "Cargo funcionario Fast Fire", type: "text", required: false },
      { name: "firma_fastfire", label: "Firma funcionario Fast Fire", type: "signature", required: false },
    ],
  },
];

export const getFormatTypeById = (id: string): FormatType | undefined =>
  FORMAT_CATALOG.find((f) => f.id === id);
