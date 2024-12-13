import { Stack, TextField, Button } from "@mui/material";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { Item } from "../../interfaces/Item";
import { useUiStore } from "../../stores/ui/ui.store";
import { PurchaseService } from "../../services/purchase.service";

interface StockFormComponentProps {
  editingItem?: Item;
}

export const StockFormComponent = ({
  editingItem,
}: StockFormComponentProps) => {
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: Item) => {
    try {
      setModal({ ...modal, open: false });
      setIsLoading(true);

      let response;
      if (editingItem)
        response = await PurchaseService.modifyItem(data);
      else response = await PurchaseService.addItemToStock(data);

      if (response.result === "OK") {
        setSnackbar({
          ...snackbar,
          open: true,
          message: `Item ${
            editingItem ? "editado" : "creado"
          } exitosamente!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          ...snackbar,
          open: true,
          message: response.result as string,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(
        `Error al intentar ${editingItem ? "editar" : "crear"} el usurio: `,
        { error }
      );
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Error al intentar ${
          editingItem ? "editar" : "crear"
        } el usurio`,
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
          label="Código"
          type="text"
          {...register("id", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.id}
          helperText={errors.id?.message as string}
          autoCapitalize="characters"
        />
        <TextField
          label="Item"
          type="text"
          {...register("name", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message as string}
          autoCapitalize="words"
        />
        <TextField
          label="Cantidad"
          type="number"
          {...register("count", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.count}
          helperText={errors.count?.message as string}
        />
        <TextField
          label="Precio"
          type="number"
          {...register("price", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.price}
          helperText={errors.price?.message as string}
        />

        <Button
          fullWidth
          type="submit"
          variant="outlined"
          size="large"
          color="success"
          title="Nuevo Item"
        >
          {editingItem ? "Editar Item" : "Crear Item"}
        </Button>
      </Stack>
    </form>
  );
};
