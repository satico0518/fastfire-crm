import { SetStateAction, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useUiStore } from "../../stores/ui/ui.store";
import { Workgroup } from "../../interfaces/Workgroup";
import { WorkgroupService } from "../../services/workgroup.service";
import { useUsersStore } from "../../stores/users/users.store";
import { getUserNameByKey } from "../../utils/utils";
import { User } from "../../interfaces/User";
import { AutocompleteField } from "../../interfaces/Shared";
import { ColorPickerComponent } from "../color-picker/ColorPickerComponent";
import { ColorResult } from "react-color";
import { Box, Typography } from "@mui/material";

interface WorkgroupsFormComponentProps {
  editingGroup?: Workgroup;
}

export const WorkgroupsFormComponent = ({
  editingGroup,
}: WorkgroupsFormComponentProps) => {
  const [bgColor, setBgColor] = useState("deepskyblue");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPrivate, setIsPrivate] = useState(editingGroup?.isPrivate ?? false);
  const [selectedMembers, setSelectedMembers] = useState<AutocompleteField[]>(
    []
  );
  const [availableMembers, setAvailableMembers] = useState<AutocompleteField[]>(
    []
  );
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const users = useUsersStore((state) => state.users);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (editingGroup) {
      setValue("name", editingGroup.name);
      setValue("description", editingGroup.description ?? "");
      setIsPrivate(editingGroup.isPrivate);
      setBgColor(editingGroup.color);

      if (editingGroup.memberKeys?.length > 0) {
        setSelectedMembers(editingGroup.memberKeys.map((key) => ({
                key: key,
                label: getUserNameByKey(key as string, users as User[]),
              })) as SetStateAction<AutocompleteField[]>
        );     
      }

      const availableEditingMembers = users
          ? users.filter(
              (user) => !editingGroup.memberKeys?.some((key) => user.key === key)
            )
          : [];

        setAvailableMembers(
          availableEditingMembers?.map((user) => ({
            key: user.key,
            label: getUserNameByKey(user.key as string, users as User[]),
          })) as SetStateAction<AutocompleteField[]>
        );

      return;
    }

    setAvailableMembers(
      users?.filter(u => u.isActive && !u.permissions.includes('PROVIDER')).map((user) => ({
        key: user.key,
        label: getUserNameByKey(user.key as string, users),
      })) as SetStateAction<AutocompleteField[]>
    );
  }, [editingGroup, setValue, users]);

  const onSubmit = async (data: Workgroup) => {
    data = {
      ...data,
      isActive: true,
      color: bgColor,
      isPrivate,
      memberKeys: selectedMembers.map((sc) => sc.key) as string[],
    };
    setModal({ ...modal, open: false });
    setIsLoading(true);

    let response;
    if (editingGroup) {
      response = await WorkgroupService.modifyWorkgroup({
        ...editingGroup,
        ...data,
      }, users as User[]);
    } else {
      response = await WorkgroupService.createWorkgroup(data, users as User[]);
    }
    setIsLoading(false);

    if (response.result === "OK") {
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Grupo de trabajo ${
          editingGroup ? "modificado" : "creado"
        } exitosamente!`,
        severity: "success",
      });
    } else {
      setSnackbar({
        ...snackbar,
        open: true,
        message: response.errorMessage as string,
        severity: "error",
      });
    }
  };

  const handleSelectedUsersChange = (options: AutocompleteField) => {
    if (
      options &&
      options.key &&
      !selectedMembers.some((u) => u.key === options.key)
    ) {
      setSelectedMembers([...selectedMembers, options]);
      setAvailableMembers(
        availableMembers.filter((au) => au.key !== options.key)
      );
    }
  };

  const handleDeleteMember = (key: string) => {
    if (!availableMembers.some((u) => u.key === key)) {
      setAvailableMembers([
        ...availableMembers,
        ...selectedMembers.filter((su) => su.key === key),
      ]);
      setSelectedMembers(selectedMembers.filter((su) => su.key !== key));
    }
  };

  const handleColorChange = (color: ColorResult) => {
    setBgColor(color.hex);
    setShowColorPicker(false);
  };

   return (
    <Box component="form" onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} sx={{ mt: 1 }}>
      <Stack spacing={3} width={"100%"}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: bgColor, 
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${bgColor}44`,
              border: '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.05)' },
              position: 'relative'
            }}
            onClick={() => setShowColorPicker(true)}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 900 }}>G</Typography>
            <ColorPickerComponent
              visible={showColorPicker}
              handleChange={handleColorChange}
            />
          </Box>
          <TextField
            label="Nombre del Grupo"
            type="text"
            {...register("name", { required: "El nombre es obligatorio" })}
            variant="outlined"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message as string}
            required
            placeholder="P. ej. marketing, ingeniería, RRHH"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Box>

        <TextField
          label="Descripción (opcional)"
          multiline
          rows={2}
          {...register("description")}
          variant="outlined"
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />

        <Box sx={{ 
          p: 2, 
          borderRadius: 3, 
          bgcolor: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Hacer Privado</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Solo tú y los colaboradores invitados tendrán acceso
            </Typography>
          </Box>
          <Switch
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            color="primary"
          />
        </Box>

        {isPrivate && (
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
              Colaboradores Invitados
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedMembers.map(({ key, label }) => (
                <Chip
                  key={key as string}
                  size="small"
                  color="info"
                  variant="outlined"
                  label={label}
                  onDelete={() => handleDeleteMember(key as string)}
                  sx={{ borderRadius: 1.5, fontWeight: 600 }}
                />
              ))}
            </Box>
            <Autocomplete
              options={availableMembers}
              includeInputInList
              fullWidth
              onChange={(_, options) => {
                handleSelectedUsersChange(options as AutocompleteField);
                setValue("colaborators", "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="colaborators"
                  label="Buscar colaboradores para agregar"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Box>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          sx={{ 
            py: 1.5, 
            borderRadius: 3, 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #0a84ff 0%, #007aff 100%)',
            boxShadow: '0 4px 15px rgba(10, 132, 255, 0.3)',
            '&:hover': { background: 'linear-gradient(135deg, #007aff 0%, #0a84ff 100%)' }
          }}
        >
          {editingGroup ? "Guardar Cambios" : "Crear Grupo"}
        </Button>
      </Stack>
    </Box>
  );
};
