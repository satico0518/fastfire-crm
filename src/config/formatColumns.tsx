import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Chip, Typography } from "@mui/material";
import { FormatSubmission, FormatStatus, FormatTypeId } from "../interfaces/Format";
import { getUserNameByKey } from "../utils/utils";
import { User } from "../interfaces/User";

type Users = User[] | null;

const statusConfig: Record<
  FormatStatus,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  DRAFT: { label: "Borrador", color: "default" },
  SUBMITTED: { label: "Enviado", color: "info" },
  REVIEWED: { label: "Aprobado", color: "success" },
  REJECTED: { label: "Rechazado", color: "error" },
};

/** Renders a thumbnail if the value is a Base64 or Cloudinary image URL */
const ImageCell = ({ value, label }: { value: unknown; label: string }) => {
  if (!value || typeof value !== "string") return <Typography variant="caption" color="text.secondary">—</Typography>;
  const isImage =
    value.startsWith("data:image/") || value.startsWith("https://res.cloudinary.com");
  if (!isImage) return <Typography variant="body2">{String(value)}</Typography>;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
      <img
        src={value}
        alt={label}
        style={{ height: 40, width: 52, objectFit: "cover", borderRadius: 4, border: "1px solid #e0e0e0" }}
      />
    </Box>
  );
};

const ImageArrayCell = ({ value }: { value: unknown }) => {
  if (!Array.isArray(value) || value.length === 0) {
    return <Typography variant="caption" color="text.secondary">Sin imagen</Typography>;
  }

  const images = value
    .map((item) => (item && typeof item === "object" && "foto" in item ? (item as any).foto : null))
    .filter(Boolean) as string[];

  if (images.length === 0) {
    return <Typography variant="caption" color="text.secondary">Sin imagen</Typography>;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
      {images.slice(0, 3).map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Foto comprobante ${idx + 1}`}
          style={{ height: 32, width: 42, objectFit: "cover", borderRadius: 4, border: "1px solid #e0e0e0" }}
        />
      ))}
      {images.length > 3 && (
        <Typography variant="caption">+{images.length - 3} más</Typography>
      )}
    </Box>
  );
};

/** Common columns shared by all format tables */
const commonColumns = (users: Users): GridColDef[] => [
  {
    field: "createdByUserKey",
    headerName: "Elaborado por",
    width: 150,
    valueGetter: (_v: unknown, row: FormatSubmission) =>
      getUserNameByKey(row.createdByUserKey, users || []),
  },
  {
    field: "status",
    headerName: "Estado",
    width: 120,
    renderCell: (params: GridRenderCellParams<FormatSubmission>) => {
      const cfg = statusConfig[params.row.status as FormatStatus] || statusConfig.DRAFT;
      return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
    },
  },
];

/** Field accessor for data object */
const dataField = (fieldName: string): string => `data.${fieldName}`;

const dataGetter = (fieldName: string) => (_v: unknown, row: FormatSubmission) =>
  row.data?.[fieldName] ?? "";

/** Column definitions for each format type */
export const getColumnsForFormat = (
  formatTypeId: FormatTypeId,
  users: Users
): GridColDef[] => {
  const shared = commonColumns(users);

  switch (formatTypeId) {
    case "ACTA_ENTREGA":
      return [
        { field: dataField("proyecto"), headerName: "Proyecto", width: 160, valueGetter: dataGetter("proyecto") },
        { field: dataField("fecha_hora_inicio"), headerName: "Fecha y Hora de Inicio", width: 180, valueGetter: dataGetter("fecha_hora_inicio") },
        { field: dataField("psi_inicial"), headerName: "PSI Inicial", width: 110, valueGetter: dataGetter("psi_inicial") },
        {
          field: dataField("foto_manometro_inicial"),
          headerName: "Foto Manómetro Inicial",
          width: 180,
          sortable: false,
          valueGetter: dataGetter("foto_manometro_inicial"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.foto_manometro_inicial} label="Manómetro Inicial" />
          ),
        },
        { field: dataField("fecha_hora_finalizacion"), headerName: "Fecha y Hora de Finalización", width: 200, valueGetter: dataGetter("fecha_hora_finalizacion") },
        { field: dataField("psi_final"), headerName: "PSI Final", width: 110, valueGetter: dataGetter("psi_final") },
        {
          field: dataField("foto_manometro_final"),
          headerName: "Foto Manómetro Final",
          width: 180,
          sortable: false,
          valueGetter: dataGetter("foto_manometro_final"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.foto_manometro_final} label="Manómetro Final" />
          ),
        },
        { field: dataField("cantidad_puntos_instalados"), headerName: "Puntos Instalados", width: 140, valueGetter: dataGetter("cantidad_puntos_instalados") },
        { field: dataField("cantidad_sensores_instalados"), headerName: "Sensores Instalados", width: 150, valueGetter: dataGetter("cantidad_sensores_instalados") },
        { field: dataField("recibido_por"), headerName: "Recibido Por", width: 150, valueGetter: dataGetter("recibido_por") },
        {
          field: dataField("firma_recibido"),
          headerName: "Firma Recibido",
          width: 140,
          sortable: false,
          valueGetter: dataGetter("firma_recibido"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma_recibido} label="Firma Recibido" />
          ),
        },
        ...shared,
      ];

    case "LEGALIZACION_CUENTAS":
      return [
        { field: dataField("proyecto"), headerName: "Proyecto", width: 160, valueGetter: dataGetter("proyecto") },
        { field: dataField("nombre"), headerName: "Nombre", width: 140, valueGetter: dataGetter("nombre") },
        { field: dataField("apellido"), headerName: "Apellido", width: 140, valueGetter: dataGetter("apellido") },
        {
          field: "cantidad_compras",
          headerName: "Cant. Compras",
          width: 140,
          valueGetter: (_v: unknown, row: FormatSubmission) => {
            const compras = row.data?.compras;
            return Array.isArray(compras) ? compras.length : 0;
          },
        },
        {
          field: "total_legalizacion",
          headerName: "Total Legalización",
          width: 160,
          valueGetter: (_v: unknown, row: FormatSubmission) => {
            const compras = row.data?.compras;
            if (Array.isArray(compras)) {
               return compras.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0);
            }
            return 0;
          },
          valueFormatter: (value: number) => `$ ${Number(value).toLocaleString()}`,
        },
        {
          field: "compras_fotos",
          headerName: "Fotos Comprobante",
          width: 200,
          sortable: false,
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageArrayCell value={p.row.data?.compras} />
          ),
        },
        ...shared,
      ];

    case "AVANCE_OBRA":
      return [
        { field: dataField("proyecto"), headerName: "Proyecto", width: 160, valueGetter: dataGetter("proyecto") },
        { field: dataField("fecha"), headerName: "Fecha", width: 120, valueGetter: dataGetter("fecha") },
        { field: dataField("elaborado_por"), headerName: "Elaborado Por", width: 150, valueGetter: dataGetter("elaborado_por") },
        { field: dataField("detalle_actividad"), headerName: "Detalle de Actividad", flex: 1, minWidth: 200, valueGetter: dataGetter("detalle_actividad") },
        {
          field: dataField("registro_fotografico"),
          headerName: "Registro Fotográfico",
          width: 160,
          sortable: false,
          valueGetter: dataGetter("registro_fotografico"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.registro_fotografico} label="Registro Fotográfico" />
          ),
        },
        {
          field: dataField("firma"),
          headerName: "Firma",
          width: 140,
          sortable: false,
          valueGetter: dataGetter("firma"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma} label="Firma" />
          ),
        },
        ...shared,
      ];

    case "ADICIONALES":
      return [
        { field: dataField("proyecto"), headerName: "Proyecto", width: 160, valueGetter: dataGetter("proyecto") },
        { field: dataField("fecha_solicitud"), headerName: "Fecha de Solicitud", width: 140, valueGetter: dataGetter("fecha_solicitud") },
        { field: dataField("nombre_oficial_encargado"), headerName: "Oficial Encargado", width: 160, valueGetter: dataGetter("nombre_oficial_encargado") },
        { field: dataField("actividad_adicional"), headerName: "Actividad Adicional", flex: 1, minWidth: 200, valueGetter: dataGetter("actividad_adicional") },
        { field: dataField("motivo_actividad"), headerName: "Motivo", flex: 1, minWidth: 150, valueGetter: dataGetter("motivo_actividad") },
        { field: dataField("nombre_quien_autoriza"), headerName: "Autoriza", width: 150, valueGetter: dataGetter("nombre_quien_autoriza") },
        {
          field: dataField("firma_autoriza"),
          headerName: "Firma Autoriza",
          width: 140,
          sortable: false,
          valueGetter: dataGetter("firma_autoriza"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma_autoriza} label="Firma Autoriza" />
          ),
        },
        ...shared,
      ];

    case "REPORTE_MANTENIMIENTO":
      return [
        { field: dataField("proyecto"), headerName: "Proyecto", width: 160, valueGetter: dataGetter("proyecto") },
        { field: dataField("fecha_mantenimiento"), headerName: "Fecha Mantenimiento", width: 140, valueGetter: dataGetter("fecha_mantenimiento") },
        { field: dataField("tecnico_responsable"), headerName: "Técnico Responsable", width: 160, valueGetter: dataGetter("tecnico_responsable") },
        { field: dataField("tipo_mantenimiento"), headerName: "Tipo Mantenimiento", width: 140, valueGetter: dataGetter("tipo_mantenimiento") },
        { field: dataField("tiempo_ejecucion"), headerName: "Tiempo (horas)", width: 120, valueGetter: dataGetter("tiempo_ejecucion") },
        {
          field: dataField("firma_tecnico"),
          headerName: "Firma Técnico",
          width: 140,
          sortable: false,
          valueGetter: dataGetter("firma_tecnico"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma_tecnico} label="Firma Técnico" />
          ),
        },
        {
          field: dataField("firma_supervisor"),
          headerName: "Firma Supervisor",
          width: 140,
          sortable: false,
          valueGetter: dataGetter("firma_supervisor"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma_supervisor} label="Firma Supervisor" />
          ),
        },
        ...shared,
      ];

    case "ACTA_VISITA_MANTENIMIENTO":
      return [
        { field: dataField("numero_acta"), headerName: "N° Acta", width: 120, valueGetter: dataGetter("numero_acta") },
        { field: dataField("fecha_visita"), headerName: "Fecha Visita", width: 120, valueGetter: dataGetter("fecha_visita") },
        { field: dataField("proyecto"), headerName: "Proyecto/Cliente", width: 160, valueGetter: dataGetter("proyecto") },
        { field: dataField("tecnico_responsable"), headerName: "Técnico", width: 140, valueGetter: dataGetter("tecnico_responsable") },
        { field: dataField("tipo_visita"), headerName: "Tipo Visita", width: 120, valueGetter: dataGetter("tipo_visita") },
        { field: dataField("contacto_cliente"), headerName: "Contacto", width: 140, valueGetter: dataGetter("contacto_cliente") },
        {
          field: dataField("firma_tecnico"),
          headerName: "Firma Técnico",
          width: 120,
          sortable: false,
          valueGetter: dataGetter("firma_tecnico"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma_tecnico} label="Firma Técnico" />
          ),
        },
        {
          field: dataField("firma_cliente"),
          headerName: "Firma Cliente",
          width: 120,
          sortable: false,
          valueGetter: dataGetter("firma_cliente"),
          renderCell: (p: GridRenderCellParams<FormatSubmission>) => (
            <ImageCell value={p.row.data?.firma_cliente} label="Firma Cliente" />
          ),
        },
        ...shared,
      ];

    default:
      return shared;
  }
};
