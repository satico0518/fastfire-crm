import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { SignaturePadField } from "../../components/signature-pad/SignaturePadField";
import { getFormatTypeById } from "../../config/formatCatalog";
import { FormatField, FormatSubmission } from "../../interfaces/Format";
import { FormatService } from "../../services/format.service";
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { SvgIconProps } from "@mui/material";
import { ElementType } from "react";

const FORMAT_ICONS: Record<string, ElementType<SvgIconProps>> = {
  LEGALIZACION_CUENTAS: ReceiptLongIcon,
  AVANCE_OBRA: EngineeringIcon,
  ADICIONALES: AddCircleOutline,
  ACTA_ENTREGA: AssignmentTurnedInIcon,
};

export const PublicFormatPage = () => {
  const { formatId } = useParams<{ formatId: string }>();
  const format = formatId ? getFormatTypeById(formatId) : undefined;
  
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setIsLoading = useUiStore((state) => state.setIsLoading);

  // Initialize form data
  useState(() => {
    if (format) {
      const initialData: Record<string, unknown> = {};
      format.fields.forEach((f) => {
        if (f.type === "dynamic-group") {
          initialData[f.name] = [{}];
        }
      });
      setFormData(initialData);
    }
  });

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async () => {
    if (!format) return;

    // Validate required fields
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
    
    validateFields(format.fields, formData);

    if (missingRequired.length > 0) {
      setSnackbar({
        open: true,
        message: `Faltan campos obligatorios: ${missingRequired.join(", ")}`,
        severity: "warning",
      });
      return;
    }

    setIsLoading(true);

    // Inject calculated sums into data
    const finalData = { ...formData };
    format.fields.forEach(f => {
      if (f.type === "calculated-sum" && f.calculateSum) {
        const parts = f.calculateSum.split(".");
        if (parts.length === 2) {
          const arr = finalData[parts[0]];
          if (Array.isArray(arr)) {
            const total = arr.reduce((acc: number, curr: any) => {
              const val = Number(curr[parts[1]]);
              return acc + (isNaN(val) ? 0 : val);
            }, 0);
            finalData[f.name] = total;
          }
        }
      }
    });

    const submission: Omit<FormatSubmission, "key"> = {
      formatTypeId: format.id,
      formatTypeName: format.name,
      status: "SUBMITTED",
      createdByUserKey: "PUBLIC",
      isPublicSubmission: true,
      createdDate: Date.now(),
      updatedDate: Date.now(),
      data: finalData,
    };

    const resp = await FormatService.createSubmission(submission);

    setIsLoading(false);

    if (resp.result === "OK") {
      setSubmitted(true);
    } else {
      setSnackbar({
        open: true,
        message: resp.errorMessage || "Error enviando formato.",
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
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
            }}
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
            onChange={(e) => setValue(field.name, e.target.value)}
            fullWidth
            size="small"
            type="number"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
            }}
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
                textField: { 
                  size: "small", 
                  fullWidth: true, 
                  required: field.required,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' }
                  }
                },
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
                textField: { 
                  size: "small", 
                  fullWidth: true, 
                  required: field.required,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' }
                  }
                },
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
          <Box key={field.name} sx={{ border: "1px solid", borderColor: "rgba(255,255,255,0.2)", borderRadius: 3, p: 2, mb: 1, bgcolor: "rgba(255,255,255,0.05)" }}>
            <FormLabel component="legend" sx={{ fontSize: "0.78rem", mb: 0.5, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
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
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>{option}</Typography>}
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
              borderColor: isUploading ? "primary.main" : "rgba(255,255,255,0.3)",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              bgcolor: isUploading ? "rgba(10,132,255,0.05)" : "rgba(255,255,255,0.02)",
              transition: "all 0.3s ease"
            }}
          >
            <FormLabel sx={{ fontSize: "0.78rem", display: "block", mb: 1.5, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{field.label}</FormLabel>
            
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
                  style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => setValue(field.name, "")}
                  sx={{ 
                    position: 'absolute', top: -10, right: -10, 
                    bgcolor: '#ff453a', color: 'white', 
                    '&:hover': { bgcolor: '#ff3b30' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
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
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'white' }}>
                  <PhotoCameraIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Tomar o subir foto</Typography>
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
          <Box key={field.name} sx={{ p: 2, borderRadius: 3, mb: 1, bgcolor: "rgba(255,255,255,0.03)", border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: "white", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {field.label}
            </Typography>
            {items.map((item, index) => (
              <Box key={index} sx={{ border: "1px solid", borderColor: "rgba(255,255,255,0.15)", p: 2, borderRadius: 3, mb: 2, bgcolor: "rgba(0,0,0,0.2)" }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Chip 
                    label={`Ítem ${index + 1}`} 
                    size="small" 
                    sx={{ fontWeight: 800, bgcolor: 'rgba(10,132,255,0.2)', color: "#0a84ff" }} 
                  />
                  <IconButton onClick={() => removeItem(index)} size="small" sx={{ color: '#ff453a' }}>
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
              sx={{ width: "100%", borderStyle: "dashed", borderRadius: 3, py: 1.2, fontWeight: 700, textTransform: 'none', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
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
              background: 'linear-gradient(135deg, rgba(48,209,88,0.2) 0%, rgba(52,199,89,0.1) 100%)',
              border: '1px solid rgba(48,209,88,0.3)',
              color: '#30d158',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5 }}>
              {field.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              $ {total.toLocaleString('es-CO')} 
            </Typography>
          </Paper>
        );
      }
      default:
        return null;
    }
  };

  // Format not found
  if (!format) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Formato no encontrado. Verifique la URL.
        </Alert>
      </Box>
    );
  }

  // Success state
  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ maxWidth: 500, width: '100%', bgcolor: 'rgba(28,28,30,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#30d158', mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
              ¡Formato enviado exitosamente!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Gracias por completar el formato de <strong>{format.name}</strong>.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const FormatIcon = FORMAT_ICONS[format.id] || ReceiptLongIcon;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1c1c1e', py: 4, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Header */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ 
              width: 64, 
              height: 64, 
              mx: 'auto', 
              mb: 2, 
              borderRadius: '50%', 
              bgcolor: 'rgba(10,132,255,0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FormatIcon sx={{ fontSize: 32, color: '#0a84ff' }} />
            </Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
              {format.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {format.description}
            </Typography>
          </CardContent>
        </Card>

        {/* Form */}
        <Card sx={{ bgcolor: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {format.fields.map((field) => renderField(field))}
            </Stack>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              sx={{ 
                mt: 4, 
                py: 1.5, 
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                bgcolor: '#0a84ff',
                '&:hover': { bgcolor: '#0070e0' }
              }}
            >
              Enviar Formato
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.4)' }}>
          Fast Fire - Formato Digital
        </Typography>
      </Box>
    </Box>
  );
};
