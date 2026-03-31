import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
  Badge,
  Paper,
} from "@mui/material";
import {
  DataGrid,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useFormatsStore } from "../../stores/formats/formats.store";
import { useUsersStore } from "../../stores/users/users.store";
import { FormatSubmission, FormatStatus, FormatTypeId, FormatField } from "../../interfaces/Format";
import { getUserNameByKey, translateTimestampToString, downloadExcelFile, exportSubmissionToPDF } from "../../utils/utils";
import { FORMAT_CATALOG, getFormatTypeById } from "../../config/formatCatalog";
import { getColumnsForFormat } from "../../config/formatColumns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BuildIcon from "@mui/icons-material/Build";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FormatService } from "../../services/format.service";
import { useAuhtStore } from "../../stores";
import { useUiStore } from "../../stores/ui/ui.store";
import { SvgIconProps } from "@mui/material";
import { ElementType } from "react";
import dayjs from "dayjs";

const FORMAT_ICONS: Record<FormatTypeId, ElementType<SvgIconProps>> = {
  LEGALIZACION_CUENTAS: ReceiptLongIcon,
  AVANCE_OBRA: EngineeringIcon,
  ADICIONALES: AddCircleOutlineIcon,
  ACTA_ENTREGA: AssignmentTurnedInIcon,
  REPORTE_MANTENIMIENTO: BuildIcon,
  ACTA_VISITA_MANTENIMIENTO: AssignmentTurnedInIcon,
};

const cardGradients: Record<FormatTypeId, string> = {
  LEGALIZACION_CUENTAS: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  AVANCE_OBRA: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  ADICIONALES: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  ACTA_ENTREGA: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  REPORTE_MANTENIMIENTO: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ACTA_VISITA_MANTENIMIENTO: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
};

const statusConfig: Record<
  FormatStatus,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  DRAFT: { label: "Borrador", color: "default" },
  SUBMITTED: { label: "Enviado", color: "info" },
  REVIEWED: { label: "Aprobado", color: "success" },
  REJECTED: { label: "Rechazado", color: "error" },
};

export const FormatResultsTable = () => {
  const submissions = useFormatsStore((state) => state.submissions);
  const users = useUsersStore((state) => state.users);
  const currentUser = useAuhtStore((state) => state.user);
  const setSnackbar = useUiStore((state) => state.setSnackbar);

  const [selectedTypeId, setSelectedTypeId] = useState<FormatTypeId | null>(null);
  const [viewSubmission, setViewSubmission] = useState<FormatSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const handleReview = async (status: "REVIEWED" | "REJECTED") => {
    if (!viewSubmission?.key || !currentUser?.key) return;
    const resp = await FormatService.reviewSubmission(
      viewSubmission.key,
      status,
      currentUser.key,
      reviewNotes || undefined
    );
    if (resp.result === "OK") {
      setSnackbar({ open: true, message: resp.message as string, severity: status === "REVIEWED" ? "success" : "warning" });
      setViewSubmission(null);
      setReviewNotes("");
    } else {
      setSnackbar({ open: true, message: resp.errorMessage || "Error", severity: "error" });
    }
  };

  const handleExportPDF = async (submission: FormatSubmission) => {
    try {
      setSnackbar({ open: true, message: "Generando PDF...", severity: "info" });
      
      const formatType = getFormatTypeById(submission.formatTypeId);
      const fields = formatType?.fields || [];
      const userName = submission.createdByUserKey === 'PUBLIC' 
        ? 'Usuario Público' 
        : getUserNameByKey(submission.createdByUserKey, users || []) || 'NA';
      const statusLabel = statusConfig[submission.status]?.label || submission.status;
      
      await exportSubmissionToPDF(submission, fields as FormatField[], userName, statusLabel);
      
      setSnackbar({ open: true, message: "PDF generado exitosamente", severity: "success" });
    } catch (error) {
      console.error("Error generando PDF:", error);
      setSnackbar({ open: true, message: "Error al generar PDF", severity: "error" });
    }
  };

  const handleExport = () => {
    if (!selectedTypeId || !selectedFormat) return;

    const data = filteredSubmissions.map(submission => {
      const row: any = {
        'Estado': statusConfig[submission.status]?.label || submission.status,
        'Creado por': submission.createdByUserKey === 'PUBLIC' 
          ? 'Usuario Público' 
          : getUserNameByKey(submission.createdByUserKey, users || []) || 'NA',
        'Fecha de Creación': translateTimestampToString(submission.createdDate),
        'Notas del Revisor': submission.reviewNotes || '',
        'Envío Público': submission.isPublicSubmission ? 'Sí' : 'No',
      };

      // Add format-specific fields
      const flattenData = (data: any, prefix = ''): any => {
        const result: any = {};
        
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.entries(item).forEach(([key, value]) => {
                const fieldName = prefix ? `${prefix} ${index + 1} - ${key}` : `${key} ${index + 1}`;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  Object.assign(result, flattenData(value, fieldName));
                } else {
                  result[fieldName] = String(value || '');
                }
              });
            } else {
              result[`${prefix || 'Item'} ${index + 1}`] = String(item || '');
            }
          });
        } else if (typeof data === 'object' && data !== null) {
          Object.entries(data).forEach(([key, value]) => {
            const fieldName = prefix ? `${prefix} - ${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              Object.assign(result, flattenData(value, fieldName));
            } else if (Array.isArray(value)) {
              Object.assign(result, flattenData(value, fieldName));
            } else {
              result[fieldName] = String(value || '');
            }
          });
        } else {
          result[prefix || 'Valor'] = String(data || '');
        }
        
        return result;
      };

      const flattenedData = flattenData(submission.data);
      Object.assign(row, flattenedData);

      return row;
    });

    const formatName = selectedFormat.name.replace(/\s+/g, '_').toLowerCase();
    downloadExcelFile(data, `${formatName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const downloadImage = (imageSrc: string, fieldName: string) => {
    try {
      const link = document.createElement("a");
      link.href = imageSrc;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${fieldName}_${timestamp}.jpg`;
      
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({ 
        open: true, 
        message: "Descargando imagen...", 
        severity: "success" 
      });
    } catch (error) {
      console.error("Error descargando imagen:", error);
      setSnackbar({ 
        open: true, 
        message: "Error al descargar la imagen", 
        severity: "error" 
      });
    }
  };

  /** Count submitted (pending) per format type */
  const pendingCount = (typeId: FormatTypeId) =>
    submissions.filter((s) => s.formatTypeId === typeId && s.status === "SUBMITTED").length;

  /** All submissions for selected type */
  const filteredSubmissions = selectedTypeId
    ? submissions.filter((s) => s.formatTypeId === selectedTypeId)
    : [];

  const selectedFormat = selectedTypeId ? getFormatTypeById(selectedTypeId) : null;
  const columns = selectedTypeId
    ? [
        ...getColumnsForFormat(selectedTypeId, users),
        {
          field: "actions",
          headerName: "",
          width: 80,
          minWidth: 70,
          maxWidth: 90,
          flex: 0,
          sortable: false,
          filterable: false,
          disableColumnMenu: true,
          renderCell: (params: GridRenderCellParams<FormatSubmission>) => (
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.3, sm: 0.5 },
              justifyContent: 'center',
              width: '100%'
            }}>
              <Tooltip title="Ver detalle">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewSubmission(params.row);
                  }}
                  sx={{ 
                    p: { xs: 0.3, sm: 0.5 },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="PDF">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportPDF(params.row);
                  }}
                  sx={{ 
                    p: { xs: 0.3, sm: 0.5 },
                    color: '#ff5252',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    },
                    '&:hover': {
                      background: 'rgba(255, 82, 82, 0.1)',
                    }
                  }}
                >
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        },
      ]
    : [];

  /** Smart field value renderer for the detail dialog */
  const isImageValue = (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    return value.startsWith("data:image/") || value.startsWith("https://res.cloudinary.com");
  };

  const renderFieldValue = (fieldName: string, value: unknown, field?: FormatField, allData?: Record<string, any>) => {
    if (field?.type === "calculated-sum" && field.calculateSum) {
      const parts = field.calculateSum.split(".");
      if (parts.length === 2 && allData) {
        const arr = allData[parts[0]];
        if (Array.isArray(arr)) {
          const total = arr.reduce((acc: number, curr: any) => {
            const val = Number(curr[parts[1]]);
            return acc + (isNaN(val) ? 0 : val);
          }, 0);
          return (
            <Typography variant="body1" sx={{ color: '#30d158', fontWeight: 800, fontSize: '1.2rem' }}>
              $ {total.toLocaleString('es-CO')}
            </Typography>
          );
        }
      }
    }
    
    if (isImageValue(value)) {
      const src = value as string;
      const isCloudinary = src.startsWith("https://");
      return (
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ position: "relative", display: "inline-block", width: "100%", maxWidth: 300 }}>
            <img
              src={src}
              alt={fieldName}
              style={{ maxHeight: 180, width: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0" }}
            />
            <Tooltip title="Descargar imagen">
              <IconButton
                size="small"
                onClick={() => downloadImage(src, fieldName)}
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  color: '#30d158',
                  background: 'rgba(28, 28, 30, 0.95)',
                  border: '1px solid rgba(48,209,88,0.5)',
                  padding: '6px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(48,209,88,0.2)',
                    boxShadow: '0 0 10px rgba(48,209,88,0.2)',
                  }
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {isCloudinary && (
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block", mt: 0.5 }}>
              📎 Imagen alojada en Cloudinary
            </Typography>
          )}
        </Box>
      );
    }
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        return (
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            {(value as Record<string, unknown>[]).map((item, idx) => (
          <Box key={idx} sx={{ border: "1px solid", borderColor: "rgba(255,255,255,0.1)", borderRadius: 2, p: 1.5, bgcolor: "rgba(255,255,255,0.03)" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: "block", color: "primary.main" }}>
                  Ítem {idx + 1}
                </Typography>
                {Object.entries(item).map(([k, v]) => (
                  <Box key={k} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", textTransform: "uppercase", display: "block", fontSize: "0.65rem" }}>
                      {k.replace(/_/g, " ")}
                    </Typography>
                    {renderFieldValue(k, v)}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        );
      }
      return value.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
          {(value as string[]).map((v) => <Chip key={v} label={v} size="small" variant="outlined" />)}
        </Box>
      ) : <Typography variant="body2" color="text.secondary">—</Typography>;
    }
    return <Typography variant="body2" sx={{ color: 'white' }}>{String(value || "—")}</Typography>;
  };

  const renderDetailDialog = () => {
    if (!viewSubmission) return null;
    const formatType = getFormatTypeById(viewSubmission.formatTypeId);
    const data = viewSubmission.data || {};
    const fields: { name: string; label: string; type?: string; calculateSum?: string }[] = formatType
      ? (formatType.fields as any[])
      : Object.keys(data).map((k) => ({ name: k, label: k }));

    return (
      <Dialog
        open={!!viewSubmission}
        onClose={() => { setViewSubmission(null); setReviewNotes(""); }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: 'rgba(28, 28, 30, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundImage: 'none',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            maxHeight: "90vh"
          }
        }}
      >
        <DialogTitle
          sx={{
            background: selectedTypeId ? cardGradients[selectedTypeId] : "#667eea",
            color: "#1c1c1e",
            fontWeight: 800,
            letterSpacing: '0.2px'
          }}
        >
          {viewSubmission.formatTypeName}
          <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={statusConfig[viewSubmission.status]?.label || viewSubmission.status}
              color={statusConfig[viewSubmission.status]?.color || "default"}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.25)", color: "white", border: "none" }}
            />
            {viewSubmission.isPublicSubmission && (
              <Chip
                label="Público"
                size="small"
                sx={{ bgcolor: "rgba(10,132,255,0.3)", color: "#0a84ff", border: "1px solid rgba(10,132,255,0.5)", fontWeight: 700 }}
              />
            )}
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {viewSubmission.createdByUserKey === 'PUBLIC' 
                ? 'Usuario Público' 
                : getUserNameByKey(viewSubmission.createdByUserKey, users || [])} — {translateTimestampToString(viewSubmission.createdDate)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ mt: 1 }}>
            {fields.map((f) => (
              <Box key={f.name} sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}
                >
                  {f.label}
                </Typography>
                {renderFieldValue(f.name, data[f.name], f as any, data)}
              </Box>
            ))}
            {viewSubmission.reviewNotes && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(255,159,10,0.1)", borderRadius: 2, border: '1px solid rgba(255,159,10,0.2)' }}>
                <Typography variant="caption" fontWeight={700} color="#ff9f0a" display="block">
                  Notas del revisor
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>{viewSubmission.reviewNotes}</Typography>
              </Box>
            )}
            {viewSubmission.status === "SUBMITTED" && (
              <TextField
                label="Notas de revisión (opcional)"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                fullWidth size="small" multiline minRows={2} 
                sx={{ 
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button 
            onClick={() => { setViewSubmission(null); setReviewNotes(""); }} 
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '10px',
              padding: '6px 14px',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                color: 'white'
              }
            }}
          >
            Cerrar
          </Button>
          {viewSubmission.status === "SUBMITTED" && (
            <>
              <Button 
                onClick={() => handleReview("REJECTED")} 
                variant="contained" 
                startIcon={<CancelIcon />} 
                size="small"
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  padding: '6px 16px',
                  border: '1px solid rgba(255,69,58,0.5)',
                  background: 'rgba(255,69,58,0.15)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255,69,58,0.25)',
                    border: '1px solid rgba(255,69,58,0.8)',
                    boxShadow: '0 0 15px rgba(255,69,58,0.3)',
                  },
                }}
              >
                Rechazar
              </Button>
              <Button 
                onClick={() => handleReview("REVIEWED")} 
                variant="contained" 
                startIcon={<CheckCircleIcon />} 
                size="small"
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  padding: '6px 16px',
                  border: '1px solid rgba(48,209,88,0.5)',
                  background: 'rgba(48,209,88,0.15)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(48,209,88,0.25)',
                    border: '1px solid rgba(48,209,88,0.8)',
                    boxShadow: '0 0 15px rgba(48,209,88,0.3)',
                  },
                }}
              >
                Aprobar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  // ─── Format selector cards ─────────────────────────────────────────────────
  if (!selectedTypeId) {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ color: "white", mb: 2, fontWeight: 700, fontSize: "1.1rem", opacity: 0.9 }}>
          Selecciona un formato para ver sus resultados
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          {FORMAT_CATALOG.map((format) => {
            const pending = pendingCount(format.id);
            const total = submissions.filter((s) => s.formatTypeId === format.id).length;
            const FormatIcon = FORMAT_ICONS[format.id];
            return (
              <Badge
                key={format.id}
                badgeContent={pending}
                color="error"
                overlap="rectangular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box
                  onClick={() => setSelectedTypeId(format.id)}
                  sx={{
                    width: "100%",
                    background: cardGradients[format.id],
                    borderRadius: "14px",
                    p: 2.5,
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 1,
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
                    },
                  }}
                >
                  <FormatIcon sx={{ fontSize: 40, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
                  <Typography fontWeight={700} sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" }, lineHeight: 1.2 }}>
                    {format.name}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "rgba(0,0,0,0.2)",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 0.4,
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.95, fontWeight: 600 }}>
                      {total} registro{total !== 1 ? "s" : ""}
                      {pending > 0 && ` · ${pending} pendiente${pending !== 1 ? "s" : ""}`}
                    </Typography>
                  </Box>
                </Box>
              </Badge>
            );
          })}
        </Box>
      </Box>
    );
  }

  // ─── Results table for selected format ────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Header - Responsive: title on first line, chips/buttons on second line in mobile */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" }, 
        gap: 1.5, 
        mb: 0.5 
      }}>
        {/* Left side: Back button + Title */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1.5,
          width: { xs: "100%", sm: "auto" }
        }}>
          <Tooltip title="Volver al selector">
            <IconButton size="small" onClick={() => setSelectedTypeId(null)} sx={{ color: "white" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {(() => {
              const Icon = FORMAT_ICONS[selectedTypeId];
              return <Icon sx={{ fontSize: 24, color: "white", opacity: 0.9 }} />;
            })()}
            <Typography fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.15rem" }, color: "white" }}>
              {selectedFormat?.name}
            </Typography>
          </Box>
        </Box>
        
        {/* Right side: Chips and Excel button - goes to second line in mobile */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          flexWrap: "wrap",
          width: { xs: "100%", sm: "auto" },
          pl: { xs: 5, sm: 0 }
        }}>
          <Chip
            label={`${filteredSubmissions.length} registro${filteredSubmissions.length !== 1 ? "s" : ""}`}
            size="small"
            variant="outlined"
            sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
          />
          {pendingCount(selectedTypeId) > 0 && (
            <Chip
              label={`${pendingCount(selectedTypeId)} pendiente${pendingCount(selectedTypeId) !== 1 ? "s" : ""}`}
              size="small"
              color="error"
              variant="filled"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
            />
          )}
          <Button
            onClick={handleExport}
            startIcon={<DownloadIcon />}
            size="small"
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.82rem' },
              borderRadius: '10px',
              padding: { xs: '4px 10px', sm: '6px 14px' },
              border: '1px solid rgba(48,209,88,0.5)',
              background: 'rgba(48,209,88,0.12)',
              backdropFilter: 'blur(10px)',
              letterSpacing: '0.3px',
              '&:hover': {
                background: 'rgba(48,209,88,0.25)',
                border: '1px solid rgba(48,209,88,0.8)',
                boxShadow: '0 0 12px rgba(48,209,88,0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Paper sx={{ 
        width: "100%", 
        height: "calc(100vh - 280px)",
        backgroundColor: 'rgba(28, 28, 30, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <DataGrid
          rows={filteredSubmissions}
          columns={columns}
          columnHeaderHeight={36}
          getRowId={(row) => row.key || row.createdDate}
          rowHeight={28}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          onRowClick={(params) => setViewSubmission(params.row as FormatSubmission)}
          localeText={{
            MuiTablePagination: { 
              labelRowsPerPage: "Filas por página",
              labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count}`,
            },
            noRowsLabel: "Sin filas",
            footerRowSelected: (count) => `${count} fila${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`,
          }}
          sx={{
            border: 0,
            fontSize: "0.82rem",
            cursor: "pointer",
            color: 'white',
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              display: "flex", 
              alignItems: "center"
            },
            '& .MuiDataGrid-actionsCell .MuiIconButton-root': {
              color: 'white'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 0,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& .MuiDataGrid-columnHeader': { 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 800,
              textTransform: 'uppercase',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              fontSize: "0.75rem",
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiTablePagination-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }
          }}
        />
      </Paper>

      {renderDetailDialog()}
    </Box>
  );
};
