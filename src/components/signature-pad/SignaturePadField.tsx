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
    <Box sx={{ width: "100%" }}>
      <FormLabel
        sx={{
          fontSize: "0.78rem",
          fontWeight: 600,
          display: "block",
          mb: 0.75,
          color: "rgba(255,255,255,0.7)",
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
            width: "100%",
            border: "1px solid",
            borderColor: "success.light",
            borderRadius: 2,
            p: 1,
            bgcolor: "rgba(255,255,255,0.05)",
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
            width: "100%",
            border: "1.5px dashed",
            borderColor: isDrawing ? "primary.main" : "divider",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.03)",
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
              <Typography variant="caption" sx={{ color: 'white' }}>Firma aquí con el dedo</Typography>
            </Box>
          )}

          <SignatureCanvas
            ref={sigRef}
            penColor="white"
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
              borderColor: "rgba(255,255,255,0.1)",
              bgcolor: "transparent",
            }}
          >
            <Button
              size="small"
              onClick={handleClear}
              disabled={!isDrawing}
              sx={{
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { background: 'rgba(255,255,255,0.05)', color: 'white' }
              }}
              startIcon={<ClearIcon />}
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
              sx={{
                color: 'white',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '4px 12px',
                border: '1px solid rgba(10,132,255,0.5)',
                background: 'rgba(10,132,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(10,132,255,0.4)',
                  border: '1px solid rgba(10,132,255,0.8)',
                  boxShadow: '0 0 10px rgba(10,132,255,0.3)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(125,125,125,0.4)',
                  color: 'rgba(245,245,245,0.8)',
                  border: '1px solid rgba(180,180,180,0.7)'
                }
              }}
            >
              Confirmar firma
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
