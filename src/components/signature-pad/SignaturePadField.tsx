import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Box, Button, FormLabel, Typography } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";

interface SignaturePadFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (dataUrl: string) => void;
}

export const SignaturePadField = ({
  label,
  required = false,
  value,
  onChange,
}: SignaturePadFieldProps) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleClear = () => {
    sigRef.current?.clear();
    onChange("");
    setIsDrawing(false);
  };

  const handleConfirm = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    // Utilizamos getCanvas() en lugar de getTrimmedCanvas() para evitar problemas
    // de compatibilidad de empaquetado (error "import_trim_canvas.default is not a function")
    const dataUrl = sigRef.current.getCanvas().toDataURL("image/png");
    onChange(dataUrl);
    setIsDrawing(false);
  };

  const hasSignature = !!value && !isDrawing;

  return (
    <Box>
      <FormLabel
        sx={{
          fontSize: "0.78rem",
          fontWeight: 600,
          display: "block",
          mb: 0.75,
          color: "text.secondary",
        }}
      >
        {label}
        {required && (
          <Typography component="span" color="error" sx={{ ml: 0.3 }}>
            *
          </Typography>
        )}
      </FormLabel>

      {hasSignature ? (
        /* ── Confirmed signature preview ─────────────────────────────── */
        <Box
          sx={{
            border: "1px solid",
            borderColor: "success.light",
            borderRadius: 2,
            p: 1,
            bgcolor: "#f9fff9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <img
            src={value}
            alt="Firma"
            style={{
              maxHeight: 80,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
          <Button
            size="small"
            color="warning"
            startIcon={<BrushIcon />}
            onClick={() => {
              onChange("");
              setIsDrawing(true);
              setTimeout(() => sigRef.current?.clear(), 50);
            }}
          >
            Volver a firmar
          </Button>
        </Box>
      ) : (
        /* ── Signature canvas ────────────────────────────────────────── */
        <Box
          sx={{
            border: "1.5px dashed",
            borderColor: isDrawing ? "primary.main" : "divider",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#fafafa",
            transition: "border-color 0.2s",
            position: "relative",
          }}
        >
          {/* Hint text when canvas is empty */}
          {!isDrawing && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                gap: 0.5,
                opacity: 0.4,
              }}
            >
              <BrushIcon sx={{ fontSize: 28 }} />
              <Typography variant="caption">Firma aquí con el dedo</Typography>
            </Box>
          )}

          <SignatureCanvas
            ref={sigRef}
            penColor="#1a1a2e"
            minWidth={1.5}
            maxWidth={3}
            velocityFilterWeight={0.7}
            onBegin={() => setIsDrawing(true)}
            canvasProps={{
              style: {
                width: "100%",
                height: 120,
                touchAction: "none", // prevents scroll interference on mobile
                display: "block",
              },
            }}
          />

          {/* Action buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              px: 1.5,
              pb: 1,
              pt: 0.5,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "white",
            }}
          >
            <Button
              size="small"
              color="inherit"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={!isDrawing}
            >
              Borrar
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleConfirm}
              disabled={!isDrawing}
            >
              Confirmar firma
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
