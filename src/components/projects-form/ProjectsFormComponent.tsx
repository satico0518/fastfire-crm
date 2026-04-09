import { SubmitHandler, FieldValues, useForm } from "react-hook-form";
import { Stack, TextField, Button, Autocomplete, Box } from "@mui/material";
import { useUiStore } from "../../stores/ui/ui.store";
import { Project } from "../../interfaces/Project";
import { ProjectService } from "../../services/project.service";
import { useCitiesStore } from "../../stores/cities/cities.store";

interface ProjectsFormComponentProps {
  editingProject?: Project;
}

const darkInputFieldSx = {
  '& label': { color: 'rgba(255,255,255,0.7)' },
  '& label.Mui-focused': { color: 'white' },
  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3)' },
  '& .MuiInput-underline:after': { borderBottomColor: 'white' },
  '& .MuiInput-input': { color: 'white' },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
};

export const ProjectsFormComponent = ({
  editingProject,
}: ProjectsFormComponentProps) => {
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const cities = useCitiesStore((state) => state.cities);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: editingProject?.name ?? "",
      location: editingProject?.location,
      budget: editingProject?.budget,
    },
  });

  const onSubmit = async (data: Project) => {
    try {
      setModal({ ...modal, open: false });
      setIsLoading(true);

      let response;
      if (editingProject)
        response = await ProjectService.updateProject({
          ...editingProject,
          ...data,
        });
      else response = await ProjectService.createProject(data);

      if (response.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: `Proyecto ${
            editingProject ? "modificado" : "creado"
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
    } catch (error) {
      console.error(
        `Error ${editingProject ? "modificando" : "creando"} proyecto.`,
        { error }
      );

      setSnackbar({
        ...snackbar,
        open: true,
        message: `Error ${
          editingProject ? "modificando" : "creando"
        } proyecto.`,
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
          {...register("name", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message as string}
          autoCapitalize="words"
          required
          sx={darkInputFieldSx}
        />
        <Autocomplete
          disablePortal
          options={cities}
          includeInputInList
          sx={{ 
            width: '100%',
            '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiAutocomplete-endAdornment': { color: 'white' }
          }}
          value={
            editingProject ? {
              key: cities.find((c) => c.label === editingProject?.location)?.key || 'NA',
              label: editingProject?.location || '',
            } : null
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ubicacion"
              type="text"
              {...register("location", { required: true })}
              variant="standard"
              fullWidth
              error={!!errors.location}
              helperText={errors.location?.message as string}
              autoCapitalize="words"
              required
              sx={darkInputFieldSx}
            />
          )}
        />
        <TextField
          label="Presupuesto"
          type="number"
          {...register("budget", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.budget}
          helperText={errors.budget?.message as string}
          sx={darkInputFieldSx}
        />
        <Box sx={{ pt: 2 }}>
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
            {editingProject ? "Modificar Proyecto" : "Crear Proyecto"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};
