import { useParams } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";

export const PublicFormatResultsPage = () => {
  const { formatId } = useParams<{ formatId: string }>();

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Resultados del Formato
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Format ID: {formatId}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Esta página está en construcción.
        </Typography>
      </Paper>
    </Box>
  );
};
