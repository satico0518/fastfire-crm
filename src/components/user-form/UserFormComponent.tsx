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
  Box,
} from "@mui/material";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { AuthService } from "../../services/auth.service";
import { Access, User } from "../../interfaces/User";
import { useUiStore } from "../../stores/ui/ui.store";
import { MultiselectComponent } from "../multi-select/MultiselectComponent";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { UsersService } from "../../services/users.service";

interface UserFormComponentProps {
  editingUser?: User;
}

const darkInputFieldSx = {
  '& label': { color: 'rgba(255,255,255,0.7)' },
  '& label.Mui-focused': { color: 'white' },
  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3)' },
  '& .MuiInput-underline:after': { borderBottomColor: 'white' },
  '& .MuiInput-input': { color: 'white' },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
};

export const UserFormComponent = ({ editingUser }: UserFormComponentProps) => {
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const [labelWg, setLabelWg] = useState<string[]>([]);
  const [accessState, setAccessState] = useState({
    TYG: true,
    ADMIN: false,
    PURCHASE: false,
    PROVIDER: false,
    FORMATER: false,
    PLANNER: false,
    MANAGER: false,
  });

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAccessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "PROVIDER") {
      setAccessState({
        ADMIN: false,
        TYG: false,
        PURCHASE: false,
        FORMATER: false,
        PLANNER: false,
        MANAGER: false,
        PROVIDER: event.target.checked,
      });
    } else {
      setAccessState({
        ...accessState,
        [event.target.name]: event.target.checked,
      });
    }
  };

  useEffect(() => {
    if (editingUser) {
      setValue("firstName", editingUser.firstName || "");
      setValue("lastName", editingUser.lastName || "");
      setValue("email", editingUser.email);
      
      const newAccessState = {
        ADMIN: !!editingUser.permissions?.includes("ADMIN"),
        TYG: !!editingUser.permissions?.includes("TYG"),
        PURCHASE: !!editingUser.permissions?.includes("PURCHASE"),
        PROVIDER: !!editingUser.permissions?.includes("PROVIDER"),
        FORMATER: !!editingUser.permissions?.includes("FORMATER"),
        PLANNER: !!editingUser.permissions?.includes("PLANNER"),
        MANAGER: !!editingUser.permissions?.includes("MANAGER"),
      };

      // Evitar actualizaciones de estado innecesarias que pueden causar bucles infinitos
      if (JSON.stringify(accessState) !== JSON.stringify(newAccessState)) {
        setAccessState(newAccessState);
      }

      const newLabels = workgroups
        ?.filter((wg) => editingUser.workgroupKeys?.includes(wg.key as string))
        .map((wg) => wg.name) as string[] || [];

      if (JSON.stringify(labelWg) !== JSON.stringify(newLabels)) {
        setLabelWg(newLabels);
      }
    }
  }, [editingUser, setValue, workgroups, accessState, labelWg]);

  const onSubmit = async (data: User) => {
    try {
      if (!labelWg.length && !accessState.PROVIDER) {
        setSnackbar({
          open: true,
          message: "Debe seleccionar al menos un grupo de trabajo!",
          severity: "warning",
        });
        return;
      }

      setModal({ ...modal, open: false });
      setIsLoading(true);

      if (!accessState.PROVIDER) {
        const selectedWorkgroups = workgroups?.filter((wg) =>
          labelWg.includes(wg.name)
        );
        const workgroupKeys = selectedWorkgroups?.map(
          (swg) => swg.key
        ) as string[];

        data = {
          ...data,
          permissions: Object.keys(accessState).filter(
            (key) => accessState[key as Access] === true
          ) as Access[],
          workgroupKeys,
        };
      } else {
        data = { ...data, permissions: ["PROVIDER"] };
      }

      let signInResponse;
      if (editingUser)
        signInResponse = await UsersService.modifyUser({
          ...editingUser,
          ...data,
        });
      else signInResponse = await AuthService.createUser(data);

      if (signInResponse.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: `Usuario ${
            editingUser ? "editado" : "creado"
          } exitosamente!`,
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
      console.error(
        `Error al intentar ${editingUser ? "editar" : "crear"} el usuario: `,
        { error }
      );
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Error al intentar ${
          editingUser ? "editar" : "crear"
        } el usuario`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
      <Stack spacing={3} width={"100%"} direction={"column"} sx={{ pt: 1 }}>
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
          sx={darkInputFieldSx}
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
          sx={darkInputFieldSx}
        />
        {!editingUser && (
          <TextField
            label="Correo"
            type="email"
            {...register("email", { required: true })}
            variant="standard"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message as string}
            required
            autoCapitalize="none"
            sx={darkInputFieldSx}
          />
        )}
        {!(editingUser?.permissions?.includes("PROVIDER")) && (
            <FormControl sx={{ m: 1 }} component="fieldset" variant="standard">
              <FormLabel component="legend" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>Permisos</FormLabel>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.TYG}
                      onChange={handleAccessChange}
                      name="TYG"
                      disabled={accessState.PROVIDER}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Tareas y Grupos"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.PURCHASE}
                      onChange={handleAccessChange}
                      name="PURCHASE"
                      disabled={accessState.PROVIDER}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Compras"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.FORMATER}
                      onChange={handleAccessChange}
                      name="FORMATER"
                      disabled={accessState.PROVIDER}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Formatos"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.PLANNER}
                      onChange={handleAccessChange}
                      name="PLANNER"
                      disabled={accessState.PROVIDER}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Agenda Planner"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.ADMIN}
                      onChange={handleAccessChange}
                      name="ADMIN"
                      disabled={accessState.PROVIDER}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Admin"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.PROVIDER}
                      onChange={handleAccessChange}
                      name="PROVIDER"
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Proveedor"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessState.MANAGER}
                      onChange={handleAccessChange}
                      name="MANAGER"
                      disabled={accessState.PROVIDER}
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  }
                  label="Manager"
                  sx={{ color: 'white', '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                />
              </FormGroup>
            </FormControl>
          )}

        {!accessState.PROVIDER && (
          <MultiselectComponent
            title="Grupos de trabajo"
            labels={workgroups?.map((wg) => wg.name) || []}
            value={labelWg}
            setValue={setLabelWg}
          />
        )}
        <Box sx={{ pt: 1 }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              padding: '12px',
              border: '1px solid rgba(48,209,88,0.5)',
              background: 'rgba(48,209,88,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(48,209,88,0.3)',
                border: '1px solid rgba(48,209,88,0.8)',
              },
            }}
          >
            {editingUser ? "Editar Usuario" : "Crear Usuario"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};
