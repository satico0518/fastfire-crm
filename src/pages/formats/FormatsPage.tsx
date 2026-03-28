import { Box, Typography } from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { useAuhtStore } from "../../stores";
import { UnauthorizedPage } from "../unauthorized/UnauthorizedPage";

export const FormatsPage = () => {
  const user = useAuhtStore((state) => state.user);
  const hasAccess =
    user?.permissions.includes("ADMIN") ||
    user?.permissions.includes("FORMATER");

  if (!hasAccess) return <UnauthorizedPage />;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 3,
        color: "white",
      }}
    >
      <ArticleOutlinedIcon sx={{ fontSize: 72, opacity: 0.6 }} />
      <Typography variant="h4" fontWeight={700}>
        Formatos
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.7 }}>
        Módulo de Formatos en construcción.
      </Typography>
    </Box>
  );
};
