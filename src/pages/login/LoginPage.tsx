import { useForm } from "react-hook-form";
import type { Login } from "../../interfaces/Login";
import Logo from "../../assets/img/Logo.jpg";

import Button from "@mui/material/Button";
import { useAuhtStore } from "../../stores";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const setIsAuth = useAuhtStore((state) => state.setIsAuth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: Login) => {
    setIsAuth(true);
    navigate('/home')
    console.log(data); // Aquí enviarías los datos al backend para autenticar
  };

  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
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
    </div>
  );
};
