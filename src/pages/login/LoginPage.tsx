import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import type { Login } from "../../interfaces/Login";
import Logo from "../../assets/img/Logo.jpg";

import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Alert, 
  CircularProgress 
} from "@mui/material";
import { useAuhtStore } from "../../stores";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { useState } from "react";
import { User } from "../../interfaces/User";
import { useUiStore } from "../../stores/ui/ui.store";

export const LoginPage = () => {
  const [isError, setIsError] = useState<string | null>(null);
  const setNewUser = useAuhtStore((state) => state.setNewUser);
  const setIsAuth = useAuhtStore((state) => state.setIsAuth);
  const setToken = useAuhtStore((state) => state.setToken);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const isLoading = useUiStore((state) => state.isLoading);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const translateErrorMessage = (message: string): string => {
    // Asegurar que estamos buscando en el mensaje completo de Firebase
    const lowerMessage = message.toLowerCase();
    
    // Credenciales inválidas - varios formatos posibles
    if (lowerMessage.includes("invalid-credential") || 
        lowerMessage.includes("invalid_credential") ||
        lowerMessage.includes("wrong-password") ||
        lowerMessage.includes("user-not-found") ||
        lowerMessage.includes("invalid-email-or-password"))
      return "Correo electrónico o contraseña incorrectos. Por favor verifique sus datos e intente nuevamente.";
    
    // Email inválido
    else if (lowerMessage.includes("invalid-email") && !lowerMessage.includes("password"))
      return "El formato del correo electrónico no es válido.";
    
    // Usuario deshabilitado
    else if (lowerMessage.includes("user-disabled"))
      return "Su cuenta ha sido deshabilitada. Contacte al administrador.";
    
    // Demasiados intentos
    else if (lowerMessage.includes("too-many-requests"))
      return "Demasiados intentos fallidos. Su cuenta ha sido bloqueada temporalmente por seguridad. Intente más tarde.";
    
    // Error de red
    else if (lowerMessage.includes("network-request-failed") || lowerMessage.includes("network"))
      return "Error de conexión. Verifique su conexión a internet e intente nuevamente.";
    
    // Si el mensaje ya es un mensaje legible (no un código de error), devolverlo tal cual
    if (message.length > 20 && !message.includes("/") && !message.includes("-")) {
      return message;
    }
    
    // Error genérico pero más amigable
    return "No se pudo iniciar sesión. Si el problema persiste, contacte al administrador del sistema.";
  };

  const onSubmit = async (data: Login) => {
    setIsError(null);
    setIsLoading(true);
    
    try {
      const signInResponse = await AuthService.signIn(data.email, data.password);
      
      if (signInResponse.result === "OK") {
        setIsAuth(true);
        setToken(await signInResponse.firebaseUser?.getIdToken() || '');
        setNewUser(signInResponse.user as User);
        navigate("/home");
      } else {
        setIsError(translateErrorMessage(signInResponse.error as string || ""));
      }
    } catch (error: any) {
      const errorMessage = error?.message || "";
      if (errorMessage.includes("network") || errorMessage.includes("Network")) {
        setIsError("Error de conexión. Verifique su conexión a internet e intente nuevamente.");
      } else {
        setIsError("No se pudo conectar con el servidor. Intente nuevamente en unos momentos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login">
      <Box 
        component="form"
        className="login__form"
        onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
      >
        <img className="login__logo" src={Logo} alt="Fast Fire Logo" />
        
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, textAlign: 'center', mb: 4, letterSpacing: 1 }}>
          FAST FIRE CRM
        </Typography>

        <TextField
          {...register("email", { required: "El correo es obligatorio" })}
          label="Correo Electrónico"
          variant="outlined"
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message as string}
          disabled={isLoading}
          autoComplete="email"
        />

        <TextField
          {...register("password", { required: "La contraseña es obligatoria" })}
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message as string}
          disabled={isLoading}
          autoComplete="current-password"
        />

        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? "Iniciando..." : "Iniciar Sesión"}
        </Button>
      </Box>

      {isError && (
        <Box className="login__form-error">
          <Alert severity="error" variant="filled">
            {isError}
          </Alert>
        </Box>
      )}
    </Box>
  );
};
