import { SetStateAction, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Stack,
  Switch,
  TextField,
  Box,
  Typography,
  Paper,
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

interface WorkgroupsFormComponentProps {
  editingGroup?: Workgroup;
}

const darkInputFieldSx = {
  '& label': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
  '& label.Mui-focused': { color: 'white' },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: 'white' },
    '& .MuiInputBase-input': { color: 'white' },
  },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
};

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
              border: '2px solid rgba(255,255,255,0.4)',
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
            sx={darkInputFieldSx}
          />
        </Box>

        <TextField
          label="Descripción (opcional)"
          multiline
          rows={2}
          {...register("description")}
          variant="outlined"
          fullWidth
          sx={darkInputFieldSx}
        />

        <Box sx={{ 
          p: 2, 
          borderRadius: 3, 
          bgcolor: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>Hacer Privado</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              Solo tú y los colaboradores invitados tendrán acceso
            </Typography>
          </Box>
          <Switch
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            color="info"
          />
        </Box>

        {isPrivate && (
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Colaboradores Invitados
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedMembers.length > 0 ? selectedMembers.map(({ key, label }) => (
                <Chip
                  key={key as string}
                  size="small"
                  label={label}
                  onDelete={() => handleDeleteMember(key as string)}
                  sx={{ 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }
                  }}
                />
              )) : (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Sin colaboradores asignados</Typography>
              )}
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
                  sx={darkInputFieldSx}
                />
              )}
              PaperComponent={({ children }) => (
                <Paper sx={{ bgcolor: '#1c1c1e', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>{children}</Paper>
              )}
            />
          </Box>
        )}

        <Box sx={{ pt: 1 }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ 
              py: 1.5, 
              borderRadius: '12px', 
              fontWeight: 700, 
              textTransform: 'none',
              background: 'rgba(10,132,255,0.2)',
              border: '1px solid rgba(10,132,255,0.5)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': { 
                background: 'rgba(10,132,255,0.3)',
                border: '1px solid rgba(10,132,255,0.8)'
              }
            }}
          >
            {editingGroup ? "Guardar Cambios" : "Crear Grupo"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
