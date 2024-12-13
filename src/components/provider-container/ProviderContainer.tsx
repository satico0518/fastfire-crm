import { useState } from "react";
import { TabPanelProps } from "../../interfaces/Tabs";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";
import LicitationTableComponent from "../table/LicitationTableComponent";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useStockStore } from "../../stores/stock/stock.store";
import { downloadExcelFile } from "../../utils/utils";
import { useUiStore } from "../../stores/ui/ui.store";
import { ProviderLicitation } from "../../interfaces/Licitation";
import { useAuhtStore } from "../../stores";
import { PurchaseService } from "../../services/purchase.service";

export interface LicitationExcel {
  name: string;
  price: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const ProviderContainer = () => {
  const [tabsValue, setTabsValue] = useState(0);
  const [items, setItems] = useState<LicitationExcel[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const currentUser = useAuhtStore((state) => state.user);
  const stockToTender = useStockStore((state) => state.stock).filter(
    (s) => s.showInTender
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: unknown) => {
    if (!items || items.length === 0) {
      setSnackbar({
        open: true,
        message: 'No se ha cargado la plantilla de licitación.',
        severity: 'error',
        duration: 5000
      });
      return;
    }

    const licitation: ProviderLicitation = {
      ...data as ProviderLicitation,
      providerEmail: currentUser?.email || '',
      providerKey: currentUser?.key || '',
      totalAmount,
    };
    
    const resp = await PurchaseService.saveProviderLicitation(licitation);

    if (resp.result === 'OK'){
      setSnackbar({
        open: true,
        message: 'Licitación enviada exitosamente.',
        severity: 'success'
      })
    } else {
      setSnackbar({
        open: true,
        message: resp.errorMessage ?? 'Error al enviar licitación.',
        severity: 'error'
      })
    }
  };

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

  const handleDownloadFile = () => {
    const jsonToExcel = stockToTender.map((s) => ({ item: s.name, precio: 0 }));
    downloadExcelFile(jsonToExcel, "plantilla_de_licitacion_Fastfire.xlsx");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          sx={{ backgroundColor: "white" }}
          value={tabsValue}
          onChange={handleTabsChange}
          aria-label="basic tabs example"
        >
          <Tab label="Licitación" {...a11yProps(0)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <div className="provider-container">
          <div className="provider-container__table">
            <LicitationTableComponent 
              items={items} 
              setItems={setItems} 
              totalAmount={totalAmount} 
              setTotalAmount={setTotalAmount}
            />
          </div>
          <div className="provider-container__form">
            <Button
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadFile}
              sx={{ color: "white", borderColor: "white" }}
              variant="outlined"
            >
              Descargar plantilla de licitación
            </Button>
            <form
              onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
            >
              <Stack
                spacing={3}
                padding={2}
                marginTop={5}
                borderRadius={2}
                width={"450px"}
                direction={"column"}
                sx={{ backgroundColor: "white" }}
              >
                <FormControlLabel
                  control={<Switch {...register("freeShipping")} />}
                  label="Envío Gratis"
                  labelPlacement="end"
                  sx={{ color: "black" }}
                />
                <FormControlLabel
                  control={<Switch {...register("nightShipping")} />}
                  label="Envío Nocturno 10:00 pm"
                  labelPlacement="end"
                  sx={{ color: "black" }}
                />
                <TextField
                  label="Plazo de pago en dias"
                  type="number"
                  {...register("paymentDays", { required: true })}
                  variant="standard"
                  error={!!errors.count}
                  required
                  helperText={errors.count?.message as string}
                />
                <TextField
                  label="Porcentaje de descuento por pago menor a 15 dias."
                  type="number"
                  {...register("percentDiscount", { required: true })}
                  variant="standard"
                  error={!!errors.count}
                  helperText={errors.count?.message as string}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="start">%</InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="outlined"
                  size="large"
                  color="success"
                  title="Enviar licitación"
                >
                  Enviar licitación
                </Button>
              </Stack>
            </form>
          </div>
        </div>
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
