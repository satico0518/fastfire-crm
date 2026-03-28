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
    if (message.includes("auth/invalid-credential") || message.includes("INVALID_LOGIN_CREDENTIALS"))
      return "¡Usuario o Contraseña incorrectos!";
    else if (message.includes("auth/too-many-requests"))
      return "¡Demasiados intentos fallidos! Usuario bloqueado temporalmente por seguridad.";
    
    return "Ocurrió un error al intentar iniciar sesión. Por favor intente más tarde.";
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
    } catch (error) {
      setIsError("Error de conexión. Verifique su internet.");
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
