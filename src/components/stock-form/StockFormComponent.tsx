import { Stack, TextField, Button, Box } from "@mui/material";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { Item } from "../../interfaces/Item";
import { useUiStore } from "../../stores/ui/ui.store";
import { PurchaseService } from "../../services/purchase.service";

interface StockFormComponentProps {
  editingItem?: Item;
}

const darkInputFieldSx = {
  '& label': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
  '& label.Mui-focused': { color: 'white' },
  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3)' },
  '& .MuiInput-underline:after': { borderBottomColor: 'white' },
  '& .MuiInput-input': { color: 'white' },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
};

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
  } = useForm({
    defaultValues: {
      id: editingItem?.id ?? "",
      name: editingItem?.name ?? "",
      count: editingItem?.count,
      price: editingItem?.price,
    }
  });

  const onSubmit = async (data: Item) => {
    try {
      setModal({ ...modal, open: false });
      setIsLoading(true);

      let response;
      if (editingItem)
        response = await PurchaseService.modifyItem({ ...editingItem, ...data });
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
      <Stack spacing={3} width={"100%"} direction={"column"} sx={{ pt: 1 }}>
        <TextField
          label="Código"
          type="text"
          {...register("id", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.id}
          helperText={errors.id?.message as string}
          autoCapitalize="characters"
          sx={darkInputFieldSx}
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
          sx={darkInputFieldSx}
        />
        <TextField
          label="Cantidad"
          type="number"
          {...register("count", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.count}
          helperText={errors.count?.message as string}
          sx={darkInputFieldSx}
        />
        <TextField
          label="Precio"
          type="number"
          {...register("price", { required: true })}
          variant="standard"
          fullWidth
          error={!!errors.price}
          helperText={errors.price?.message as string}
          sx={darkInputFieldSx}
        />

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
            {editingItem ? "Editar Item" : "Crear Item"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};
