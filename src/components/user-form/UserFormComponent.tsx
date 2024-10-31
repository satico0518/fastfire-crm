import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
} from "@mui/material";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { AuthService } from "../../services/auth.service";
import { Access, User } from "../../interfaces/User";
import { useUiStore } from "../../stores/ui/ui.store";

interface UserFormComponentProps {
  editingUser?: User;
}

export const UserFormComponent = ({ editingUser }: UserFormComponentProps) => {
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const [accessState, setAccessState] = useState({
    TYP: true,
    ADMIN: false,
    PURCHASE: false,
  });

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAccessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccessState({
      ...accessState,
      [event.target.name]: event.target.checked,
    });
  };

  useEffect(() => {
    if (editingUser) {
      setValue("firstName", editingUser.firstName);
      setValue("lastName", editingUser.lastName);
      setValue("email", editingUser.email);
      setAccessState({
        ADMIN: editingUser.permissions.includes("ADMIN"),
        TYP: editingUser.permissions.includes("TYP"),
        PURCHASE: editingUser.permissions.includes("PURCHASE"),
      });
    }
  }, [editingUser, setValue]);

  const onSubmit = async (data: User) => {
    try {
      setModal({ ...modal, open: false });
      setIsLoading(true);
      data = {
        ...data,
        permissions: Object.keys(accessState).filter(
          (key) => accessState[key as Access] === true
        ) as Access[],
      };

      let signInResponse;
      if (editingUser)
        signInResponse = await AuthService.modifyUser({
          ...editingUser,
          ...data,
        });
      else signInResponse = await AuthService.createUser(data);

      if (signInResponse.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: `Usuario ${editingUser ? 'editado' : 'creado'} exitosamente!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          ...snackbar,
          open: true,
          message: signInResponse.result as string,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(`Error al intentar ${editingUser ? 'editar' : 'crear'} el usurio: `, {error});
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Error al intentar ${editingUser ? 'editar' : 'crear'} el usurio`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
      <Stack spacing={2} width={"100%"} direction={"column"}>
        <TextField
          label="Nombre"
          type="text"
          {...register("firstName", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.firstName}
          helperText={errors.firstName?.message as string}
          autoCapitalize="words"
          required
        />
        <TextField
          label="Apellido"
          type="text"
          {...register("lastName", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.lastName}
          helperText={errors.lastName?.message as string}
          autoCapitalize="words"
          required
        />
        {!editingUser && <TextField
          label="Correo"
          type="email"
          {...register("email", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message as string}
          required
          autoCapitalize="none"
        />}
        <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
          <FormLabel component="legend">Permisos</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={accessState.TYP}
                  onChange={handleAccessChange}
                  name="TYP"
                />
              }
              label="Tareas y Proyectos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={accessState.PURCHASE}
                  onChange={handleAccessChange}
                  name="PURCHASE"
                />
              }
              label="Compras"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={accessState.ADMIN}
                  onChange={handleAccessChange}
                  name="ADMIN"
                />
              }
              label="Admin"
            />
          </FormGroup>
        </FormControl>
        <Button
          fullWidth
          type="submit"
          variant="outlined"
          size="large"
          color="success"
        >
          {editingUser ? "Editar Usuario" : "Crear Usuario"}
        </Button>
      </Stack>
    </form>
  );
};
