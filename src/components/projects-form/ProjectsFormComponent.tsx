import { SubmitHandler, FieldValues, useForm } from "react-hook-form";
import { Stack, TextField, Button, Autocomplete } from "@mui/material";
import { useUiStore } from "../../stores/ui/ui.store";
import { Project } from "../../interfaces/Project";
import { ProjectService } from "../../services/project.service";
import { useCitiesStore } from "../../stores/cities/cities.store";

interface ProjectsFormComponentProps {
  editingProject?: Project;
}

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

      setIsLoading(false);

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
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
      <Stack spacing={2} width={"100%"} direction={"column"}>
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
        />
        <Autocomplete
          disablePortal
          options={cities}
          includeInputInList
          sx={{ width: 300 }}
          value={
            editingProject && {
              key: cities.filter((c) => c.label === editingProject?.location)[0].key,
              label: editingProject?.location,
            }
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
        />
        <Button
          fullWidth
          type="submit"
          variant="outlined"
          size="large"
          color="success"
        >
          {editingProject ? "Modificar Proyecto" : "Crear Proyecto"}
        </Button>
      </Stack>
    </form>
  );
};
