import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";
import { SignaturePadField } from "../signature-pad/SignaturePadField";
import { FORMAT_CATALOG } from "../../config/formatCatalog";
import { FormatType, FormatField, FormatSubmission, FormatTypeId } from "../../interfaces/Format";
import { FormatService } from "../../services/format.service";
import { useAuhtStore } from "../../stores";
import { useUiStore } from "../../stores/ui/ui.store";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import imageCompression from "browser-image-compression";
import SendIcon from "@mui/icons-material/Send";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { SvgIconProps } from "@mui/material";
import { ElementType } from "react";

const FORMAT_ICONS: Record<FormatTypeId, ElementType<SvgIconProps>> = {
  LEGALIZACION_CUENTAS: ReceiptLongIcon,
  AVANCE_OBRA: EngineeringIcon,
  ADICIONALES: AddCircleOutlineIcon,
  ACTA_ENTREGA: AssignmentTurnedInIcon,
};

export const FormatSelector = () => {
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(new Set());
  const currentUser = useAuhtStore((state) => state.user);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setIsLoading = useUiStore((state) => state.setIsLoading);

  const handleOpenForm = (format: FormatType) => {
    setSelectedFormat(format);
    setUploadingFields(new Set());
    
    // Pre-initialize specific fields to improve UX
    const initialData: Record<string, unknown> = {};
    format.fields.forEach((f) => {
      if (f.type === "dynamic-group") {
        // Enforce always starting with at least 1 empty group block
        initialData[f.name] = [{}]; 
      }
    });

    setFormData(initialData);
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!selectedFormat || !currentUser) return;

    // Validate required fields (only if not draft)
    if (!asDraft) {
      const missingRequired: string[] = [];
      const validateFields = (fields: any[], data: Record<string, unknown>, parentContext = "") => {
        fields.forEach(f => {
          if (f.type === "dynamic-group") {
            const arr = data[f.name] as Record<string, unknown>[];
            if (f.required && (!arr || arr.length === 0)) {
               missingRequired.push(`${parentContext}${f.label}`);
            } else if (arr && Array.isArray(arr) && f.subFields) {
               arr.forEach((item, idx) => {
                 validateFields(f.subFields, item as Record<string, unknown>, `${parentContext}${f.label} (Ítem ${idx + 1}) - `);
               });
            }
          } else if (f.required) {
            const val = data[f.name];
            if (val === undefined || val === null || String(val).trim() === "") {
               missingRequired.push(`${parentContext}${f.label}`);
            }
          }
        });
      };
      
      validateFields(selectedFormat.fields, formData);

      if (missingRequired.length > 0) {
        setSnackbar({
          open: true,
          message: `Faltan campos obligatorios: ${missingRequired.join(", ")}`,
          severity: "warning",
        });
        return;
      }
    }

    setIsLoading(true);

    const submission: Omit<FormatSubmission, "key"> = {
      formatTypeId: selectedFormat.id,
      formatTypeName: selectedFormat.name,
      status: asDraft ? "DRAFT" : "SUBMITTED",
      createdByUserKey: currentUser.key || "unknown",
      createdDate: Date.now(),
      updatedDate: Date.now(),
      data: formData,
    };

    const resp = await FormatService.createSubmission(submission);

    setIsLoading(false);

    if (resp.result === "OK") {
      setSnackbar({
        open: true,
        message: asDraft
          ? "Borrador guardado exitosamente!"
          : "Formato enviado exitosamente!",
        severity: "success",
      });
      setSelectedFormat(null);
      setFormData({});
    } else {
      setSnackbar({
        open: true,
        message: resp.errorMessage || "Error guardando formato.",
        severity: "error",
      });
    }
  };

  const renderField = (field: FormatField, groupData?: Record<string, unknown>, onGroupFieldChange?: (name: string, val: unknown) => void, groupIndex?: number) => {
    const fieldKey = groupData && groupIndex !== undefined ? `${field.name}_${groupIndex}` : field.name;
    const getValue = (name: string): unknown => groupData ? groupData[name] : formData[name];
    const setValue = (name: string, val: unknown) => {
      if (groupData && onGroupFieldChange) onGroupFieldChange(name, val);
      else handleFieldChange(name, val);
    };

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.name}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            value={(getValue(field.name) as string) || ""}
            onChange={(e) => setValue(field.name, e.target.value)}
            fullWidth
            size="small"
          />
        );
      case "textarea":
        return (
          <TextField
            key={field.name}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            value={(getValue(field.name) as string) || ""}
            onChange={(e) => setValue(field.name, e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={3}
            maxRows={6}
          />
        );
      case "number":
        return (
          <TextField
            key={field.name}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            value={(getValue(field.name) as string) || ""}
            onChange={(e) => {
              const val = e.target.value;
              setValue(field.name, val);
            }}
            fullWidth
            size="small"
            type="number"
          />
        );
      case "date": {
        let minDate: Dayjs | undefined = undefined;
        if (field.minDateFromField && getValue(field.minDateFromField)) {
          const minFieldVal = getValue(field.minDateFromField) as string;
          minDate = minFieldVal.includes(":")
            ? dayjs(minFieldVal, "DD/MM/YYYY HH:mm")
            : dayjs(minFieldVal, "DD/MM/YYYY");
        }
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs} key={field.name}>
            <DatePicker
              label={field.label}
              value={getValue(field.name) ? dayjs(getValue(field.name) as string, "DD/MM/YYYY") : null}
              onChange={(val) =>
                setValue(field.name, val ? val.format("DD/MM/YYYY") : "")
              }
              format="DD/MM/YYYY"
              minDate={minDate}
              slotProps={{
                textField: { size: "small", fullWidth: true, required: field.required },
              }}
            />
          </LocalizationProvider>
        );
      }
      case "datetime": {
        let minDateTime: Dayjs | undefined = undefined;
        if (field.minDateFromField && getValue(field.minDateFromField)) {
          const minFieldVal = getValue(field.minDateFromField) as string;
          minDateTime = minFieldVal.includes(":")
            ? dayjs(minFieldVal, "DD/MM/YYYY HH:mm")
            : dayjs(minFieldVal, "DD/MM/YYYY");
        }
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs} key={field.name}>
            <DateTimePicker
              label={field.label}
              value={getValue(field.name) ? dayjs(getValue(field.name) as string, "DD/MM/YYYY HH:mm") : null}
              onChange={(val) =>
                setValue(field.name, val ? val.format("DD/MM/YYYY HH:mm") : "")
              }
              format="DD/MM/YYYY HH:mm"
              minDateTime={minDateTime}
              slotProps={{
                textField: { size: "small", fullWidth: true, required: field.required },
              }}
            />
          </LocalizationProvider>
        );
      }
      case "checkbox-group": {
        const selectedOptions = (getValue(field.name) as string[]) || [];
        const toggle = (option: string) => {
          const updated = selectedOptions.includes(option)
            ? selectedOptions.filter((o) => o !== option)
            : [...selectedOptions, option];
          setValue(field.name, updated);
        };
        return (
          <Box key={field.name} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
            <FormLabel component="legend" sx={{ fontSize: "0.78rem", mb: 0.5, fontWeight: 700 }}>
              {field.label}
            </FormLabel>
            <FormGroup>
              {(field.options || []).map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedOptions.includes(option)}
                      onChange={() => toggle(option)}
                    />
                  }
                  label={<Typography variant="body2">{option}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        );
      }
      case "image": {
        const isUploading = uploadingFields.has(fieldKey);
        const currentVal = getValue(field.name) as string;

        return (
          <Box
            key={field.name}
            sx={{
              border: "1px dashed",
              borderColor: isUploading ? "primary.main" : "divider",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              bgcolor: isUploading ? "rgba(10,132,255,0.05)" : "transparent",
              transition: "all 0.3s ease"
            }}
          >
            <FormLabel sx={{ fontSize: "0.78rem", display: "block", mb: 1.5, fontWeight: 700 }}>{field.label}</FormLabel>
            
            {isUploading ? (
              <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={30} thickness={5} sx={{ color: '#0a84ff' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0a84ff' }}>Comprimiendo imagen...</Typography>
              </Box>
            ) : currentVal ? (
              <Box sx={{ position: 'relative', width: 'fit-content', mx: 'auto' }}>
                <img
                  src={currentVal}
                  alt={field.label}
                  style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => setValue(field.name, "")}
                  sx={{ 
                    position: 'absolute', top: -10, right: -10, 
                    bgcolor: '#ff453a', color: 'white', 
                    '&:hover': { bgcolor: '#ff3b30' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                component="label"
                sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer", py: 2 }}
              >
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%', color: 'text.secondary' }}>
                  <PhotoCameraIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>Tomar o subir foto</Typography>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const originalFile = e.target.files?.[0];
                    if (!originalFile) return;

                    setUploadingFields((prev: Set<string>) => {
                      const next = new Set(prev);
                      next.add(fieldKey);
                      return next;
                    });
                    
                    try {
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1200,
                        useWebWorker: true,
                        initialQuality: 0.8,
                      };
                      
                      let fileToUse = originalFile;
                      if (originalFile.type.startsWith("image/")) {
                        try {
                          fileToUse = await imageCompression(originalFile, options);
                        } catch (err) {
                          console.warn("Compression failed, using original", err);
                        }
                      }
                      
                      const MAX_BASE64_BYTES = 9 * 1024 * 1024;
                      if (fileToUse.size > MAX_BASE64_BYTES) {
                         const uwScript = document.getElementById("uw-format");
                         const loadAndUpload = () => {
                           // @ts-ignore
                           const widget = window.cloudinary?.createUploadWidget(
                             { cloudName: "fastfire", uploadPreset: "vr0sleie" },
                             (_err: any, result: any) => {
                               if (!_err && result?.event === "success") {
                                 setValue(field.name, result.info.secure_url);
                                 setUploadingFields((prev: Set<string>) => {
                                   const next = new Set(prev);
                                   next.delete(fieldKey);
                                   return next;
                                 });
                               }
                             }
                           );
                           widget?.open();
                         };
                         if (!uwScript) {
                           const script = document.createElement("script");
                           script.id = "uw-format";
                           script.src = "https://upload-widget.cloudinary.com/global/all.js";
                           script.async = true;
                           script.onload = loadAndUpload;
                           document.head.appendChild(script);
                         } else {
                           loadAndUpload();
                         }
                      } else {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setValue(field.name, reader.result as string);
                          setUploadingFields((prev: Set<string>) => {
                            const next = new Set(prev);
                            next.delete(fieldKey);
                            return next;
                          });
                        };
                        reader.readAsDataURL(fileToUse);
                      }
                    } catch (error) {
                      console.error("Error processing image:", error);
                      setUploadingFields((prev: Set<string>) => {
                        const next = new Set(prev);
                        next.delete(fieldKey);
                        return next;
                      });
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        );
      }
      case "signature":
        return (
          <SignaturePadField
            key={field.name}
            label={field.label}
            required={field.required}
            value={(getValue(field.name) as string) || ""}
            onChange={(val) => setValue(field.name, val)}
          />
        );
      case "dynamic-group": {
        const items = (getValue(field.name) as Record<string, unknown>[]) || [];
        const updateItem = (index: number, subName: string, subValue: unknown) => {
          const newItems = [...items];
          newItems[index] = { ...newItems[index], [subName]: subValue };
          setValue(field.name, newItems);
        };
        const removeItem = (index: number) => {
          const newItems = items.filter((_, i) => i !== index);
          setValue(field.name, newItems);
        };
        const addItem = () => {
          setValue(field.name, [...items, {}]);
        };
        return (
          <Box key={field.name} sx={{ p: 2, borderRadius: 3, mb: 1, bgcolor: "rgba(0,0,0,0.02)", border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: "text.primary", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {field.label}
            </Typography>
            {items.map((item, index) => (
              <Box key={index} sx={{ border: "1px solid", borderColor: "divider", p: 2, borderRadius: 3, mb: 2, bgcolor: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Chip 
                    label={`Ítem ${index + 1}`} 
                    size="small" 
                    sx={{ fontWeight: 800, bgcolor: 'primary.50', color: "primary.main", borderRadius: 1.5 }} 
                  />
                  <IconButton onClick={() => removeItem(index)} size="small" sx={{ color: '#ff453a', bgcolor: 'rgba(255,69,58,0.05)', '&:hover': { bgcolor: 'rgba(255,69,58,0.1)' } }}>
                    <DeleteOutlineIcon fontSize="small"/>
                  </IconButton>
                </Box>
                <Stack spacing={2.5}>
                  {(field.subFields || []).map((subField) => renderField(subField, item, (n, v) => updateItem(index, n, v), index) )}
                </Stack>
              </Box>
            ))}
            <Button 
              variant="outlined" 
              size="medium" 
              startIcon={<AddCircleOutlineIcon />}
              onClick={addItem} 
              sx={{ width: "100%", borderStyle: "dashed", borderRadius: 3, py: 1.2, fontWeight: 700, textTransform: 'none' }}
            >
              {field.addLabel || "+ Añadir ítem"}
            </Button>
          </Box>
        );
      }
      case "calculated-sum": {
        let total = 0;
        if (field.calculateSum) {
          const parts = field.calculateSum.split(".");
          if (parts.length === 2) {
            const arr = getValue(parts[0]);
            if (Array.isArray(arr)) {
              total = arr.reduce((acc: number, curr: any) => {
                const val = Number(curr[parts[1]]);
                return acc + (isNaN(val) ? 0 : val);
              }, 0);
            }
          }
        }
        return (
          <Paper 
            key={field.name} 
            elevation={0}
            sx={{ 
              p: 2.5, 
              mt: 2,
              borderRadius: 4, 
              background: 'linear-gradient(135deg, rgba(48,209,88,0.15) 0%, rgba(52,199,89,0.05) 100%)',
              border: '1px solid rgba(48,209,88,0.2)',
              color: '#30d158',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, mb: 0.5 }}>
              {field.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, textShadow: '0 2px 4px rgba(48,209,88,0.2)' }}>
              $ {total.toLocaleString('es-CO')} 
            </Typography>
          </Paper>
        );
      }
      default:
        return null;
    }
  };

  const cardGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  ];

  return (
    <>
      {/* Card Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {FORMAT_CATALOG.map((format, idx) => (
          <Card
            key={format.id}
            sx={{
              background: cardGradients[idx % cardGradients.length],
              color: "white",
              borderRadius: "16px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              },
            }}
          >
            <CardActionArea
              onClick={() => handleOpenForm(format)}
              sx={{ height: "100%", p: 2 }}
            >
              <CardContent sx={{ textAlign: "center", p: 1 }}>
                {(() => {
                  const FormatIcon = FORMAT_ICONS[format.id];
                  return <FormatIcon sx={{ fontSize: 52, mb: 1, opacity: 0.95, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }} />;
                })()}
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" } }}>
                  {format.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1.5,
                    fontSize: "0.73rem",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    display: { xs: "none", sm: "block" },
                    color: "white",
                    textShadow: "0 1px 4px rgba(0,0,0,0.45)",
                    background: "rgba(0,0,0,0.18)",
                    borderRadius: "8px",
                    px: 1,
                    py: 0.5,
                  }}
                >
                  {format.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Form Dialog */}
      <Dialog
        open={!!selectedFormat}
        onClose={() => setSelectedFormat(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "90vh",
          },
        }}
      >
        {selectedFormat && (
          <>
            <DialogTitle
              sx={{
                background: cardGradients[FORMAT_CATALOG.findIndex((f) => f.id === selectedFormat.id) % cardGradients.length],
                color: "white",
                fontWeight: 700,
              }}
            >
              {selectedFormat.name}
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {selectedFormat.description}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, mt: 1 }}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {selectedFormat.fields.map((field) => renderField(field))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button
                onClick={() => setSelectedFormat(null)}
                color="inherit"
                size="small"
              >
                Cancelar
              </Button>

              <Button
                onClick={() => handleSubmit(false)}
                variant="contained"
                startIcon={<SendIcon />}
                size="small"
              >
                Enviar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};
