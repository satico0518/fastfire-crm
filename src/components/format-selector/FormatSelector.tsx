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
  const currentUser = useAuhtStore((state) => state.user);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setIsLoading = useUiStore((state) => state.setIsLoading);

  const handleOpenForm = (format: FormatType) => {
    setSelectedFormat(format);
    
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

  const renderField = (field: FormatField, groupData?: Record<string, unknown>, onGroupFieldChange?: (name: string, val: unknown) => void) => {
    // Utility to get/set values resolving local vs group state
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
            onChange={(e) => setValue(field.name, e.target.value)}
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
            <FormLabel component="legend" sx={{ fontSize: "0.78rem", mb: 0.5 }}>
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
      case "image":
        return (
          <Box
            key={field.name}
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
              textAlign: "center",
            }}
          >
            <FormLabel sx={{ fontSize: "0.78rem", display: "block", mb: 1 }}>{field.label}</FormLabel>
            {getValue(field.name) ? (
              <Box>
                <img
                  src={getValue(field.name) as string}
                  alt={field.label}
                  style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8 }}
                />
                <Button
                  size="small"
                  color="error"
                  sx={{ mt: 0.5, display: "block", mx: "auto" }}
                  onClick={() => setValue(field.name, "")}
                >
                  Quitar foto
                </Button>
              </Box>
            ) : (
              <Box
                component="label"
                sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, cursor: "pointer" }}
              >
                <PhotoCameraIcon sx={{ fontSize: 32, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">Toca para subir foto</Typography>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const MAX_BASE64_BYTES = 9 * 1024 * 1024;

                    if (file.size > MAX_BASE64_BYTES) {
                      const uwScript = document.getElementById("uw-format");
                      const loadAndUpload = () => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore window.cloudinary injected by CDN
                        const widget = window.cloudinary?.createUploadWidget(
                          { cloudName: "fastfire", uploadPreset: "vr0sleie" },
                          (_err: unknown, result: { event: string; info: { secure_url: string } }) => {
                            if (!_err && result?.event === "success") {
                              setValue(field.name, result.info.secure_url);
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
                        document.body.appendChild(script);
                      } else {
                        loadAndUpload();
                      }
                    } else {
                      const reader = new FileReader();
                      reader.onloadend = () => setValue(field.name, reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        );
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
          <Box key={field.name} sx={{ border: "1px dashed", borderColor: "divider", p: 1.5, borderRadius: 2, mb: 1, bgcolor: "#fafafa" }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: "text.primary" }}>{field.label}</Typography>
            {items.map((item, index) => (
              <Box key={index} sx={{ border: "1px solid", borderColor: "divider", p: 2, borderRadius: 2, mb: 2, bgcolor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, px: 1.5, py: 0.5, bgcolor: 'primary.50', color: "primary.main", borderRadius: 1 }}>
                    Item {index + 1}
                  </Typography>
                  <IconButton onClick={() => removeItem(index)} size="small" color="error" sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}>
                    <DeleteOutlineIcon fontSize="small"/>
                  </IconButton>
                </Box>
                <Stack spacing={2}>
                  {(field.subFields || []).map((subField) => renderField(subField, item, (n, v) => updateItem(index, n, v)) )}
                </Stack>
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={addItem} sx={{ width: "100%", borderStyle: "dashed" }}>
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
          <Box key={field.name} sx={{ p: 2, bgcolor: "success.light", borderRadius: 2, color: "success.contrastText" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.9, display: "block", mb: 0.5 }}>
              {field.label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              $ {total.toLocaleString()} 
            </Typography>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  // Gradient palette for cards
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
