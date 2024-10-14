import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import type { Login } from "../../interfaces/Login";
import Logo from "../../assets/img/Logo.jpg";

import Button from "@mui/material/Button";
import { useAuhtStore } from "../../stores";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { useState } from "react";


export const LoginPage = () => {
    const [isError, setIsError] = useState<string | null>(null)
  const setIsAuth = useAuhtStore((state) => state.setIsAuth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const translateErrorMessage = (message: string): string => {
    if (message.includes('auth/invalid-credential'))
        return 'Usuario o Contraseña incorrectos!'
    else if (message.includes('auth/too-many-requests'))
        return 'Demasiados intentos fallidos, usuario bloqueado! Informe al administrador.';

    return message;
  }

  const onSubmit = async (data: Login) => {
    const signInResponse = await AuthService.signIn(data.email, data.password);

    console.log({signInResponse});

    if (signInResponse.result === 'OK') {
        setIsAuth(true);
        navigate("/home");
    } else {
        setIsError(translateErrorMessage(signInResponse.error?.message as string) ?? 'Error al intentar iniciar sesion')
        console.error(signInResponse.error?.code)
    } // Aquí enviarías los datos al backend para autenticar
  };


  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
        <img className="login__logo" src={Logo} />
        <input
          {...register("email", { required: true })}
          placeholder="Correo"
        />
        {errors.email && <span>Este campo es requerido.</span>}

        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Contraseña"
        />
        {errors.password && <span>Este campo es requerido.</span>}

        <Button type="submit" variant="outlined" size="large">
          Iniciar Sesión
        </Button>
      </form>
      {isError && <span className="login__form-error">{isError}</span>}
    </div>
  );
};
