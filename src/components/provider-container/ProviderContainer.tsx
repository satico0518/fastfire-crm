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
  Paper,
} from "@mui/material";
import LicitationTableComponent from "../table/LicitationTableComponent";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useStockStore } from "../../stores/stock/stock.store";
import {
  downloadExcelFile,
  formatToCOP,
  translateTimestampToString,
} from "../../utils/utils";
import { useUiStore } from "../../stores/ui/ui.store";
import {
  LicitationExcel,
  ProviderLicitation,
} from "../../interfaces/Licitation";
import { useAuhtStore } from "../../stores";
import { PurchaseService } from "../../services/purchase.service";
import logo from "../../assets/img/Logo.jpg";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Item } from "../../interfaces/Item";

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

const paginationModel = { page: 0, pageSize: 50 };

export const ProviderContainer = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabsValue, setTabsValue] = useState(0);
  const [history, setHistory] = useState<ProviderLicitation>();
  const [items, setItems] = useState<LicitationExcel[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const currentUser = useAuhtStore((state) => state.user);
  const stockToTender = useStockStore((state) => state.stock).filter(
    (s) => s.showInTender
  );

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Item",
      type: "string",
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <span>{row.name.toUpperCase()}</span>
      ),
    },
    {
      field: "price",
      headerName: "Precio Unitario",
      type: "number",
      width: 150,
      headerAlign: "center",
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <span>{formatToCOP(row.price)}</span>
      ),
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: ProviderLicitation) => {
    if (!items || items.length === 0) {
      setSnackbar({
        open: true,
        message: "No se ha cargado la plantilla de licitación.",
        severity: "error",
        duration: 5000,
      });
      return;
    }

    if (data.percentDiscount < 0 || data.percentDiscount > 100) {
      setSnackbar({
        open: true,
        message: "Ingrese un valor válido de porcetaje de descuento.",
        severity: "error",
        duration: 5000,
      });
      return;
    }
    if (data.paymentDays < 0) {
      setSnackbar({
        open: true,
        message: "Ingrese un valor válido de plazo de pago en dias.",
        severity: "error",
        duration: 5000,
      });
      return;
    }

    const licitation: ProviderLicitation = {
      ...(data as ProviderLicitation),
      licitationDate: Date.now(),
      providerEmail: currentUser?.email || "",
      providerKey: currentUser?.key || "",
      totalAmount,
      licitation: items as LicitationExcel[],
    };

    const resp = await PurchaseService.saveProviderLicitation(licitation);

    if (resp.result === "OK") {
      setSnackbar({
        open: true,
        message: "Licitación enviada exitosamente.",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: resp.errorMessage ?? "Error al enviar licitación.",
        severity: "error",
      });
    }
  };

  const handleGetHistory = async () => {
    setIsLoading(true);
    const historyResp = await PurchaseService.getProviderLicitation(
      currentUser?.key as string
    );
    if (historyResp) {
      setHistory(historyResp);
    } else {
      setSnackbar({
        open: true,
        message: "Error cargando histórico.",
        severity: "error",
      });
    }
    setIsLoading(false);
  };

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

  const handleDownloadFile = () => {
    const jsonToExcel = stockToTender.map((s) => ({
      id: s.id,
      item: s.name,
      precio: 0,
    }));
    downloadExcelFile(jsonToExcel, "plantilla_de_licitacion_Fastfire.xlsx", logo);
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
          <Tab label="Histórico" {...a11yProps(1)} onFocus={handleGetHistory} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <div className="provider-container">
          {new Date().getDate() >= 13 ? (
            <>
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
                  size="small"
                  sx={{ 
                    color: "white",
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    mb: 2,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.5)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Descargar plantilla de licitación
                </Button>
                <form
                  onSubmit={handleSubmit(
                    onSubmit as SubmitHandler<FieldValues>
                  )}
                >
                  <Stack
                    spacing={3}
                    padding={3}
                    marginTop={2}
                    borderRadius={3}
                    width={"450px"}
                    direction={"column"}
                    sx={{ 
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }}
                  >
                    <FormControlLabel
                      control={<Switch {...register("freeShipping")} color="info" />}
                      label="Envío Gratis"
                      labelPlacement="end"
                      sx={{ color: "black", '& .MuiFormControlLabel-label': { fontWeight: 600 } }}
                    />
                    <FormControlLabel
                      control={<Switch {...register("nightShipping")} color="info" />}
                      label="Envío Nocturno 10:00 pm"
                      labelPlacement="end"
                      sx={{ color: "black", '& .MuiFormControlLabel-label': { fontWeight: 600 } }}
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
                      variant="contained"
                      size="large"
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid rgba(48,209,88,0.5)',
                        background: 'rgba(48,209,88,0.2)',
                        backdropFilter: 'blur(10px)',
                        color: '#1a1a1a',
                        '&:hover': {
                          background: 'rgba(48,209,88,0.3)',
                          border: '1px solid rgba(48,209,88,0.8)',
                        },
                      }}
                    >
                      Enviar licitación
                    </Button>
                  </Stack>
                </form>
              </div>
            </>
          ) : (
            <span>Licitación disponible a partir del 25 del mes.</span>
          )}
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={1}>
        {history ? (
          <div className="historic">
            <div className="table">
              <Paper sx={{ height: "calc(100vh - 180px)", width: "550px" }}>
                <DataGrid
                  rows={Object.values(history.licitation)}
                  columns={columns}
                  initialState={{ pagination: { paginationModel } }}
                  pageSizeOptions={[50]}
                  rowHeight={25}
                  showColumnVerticalBorder
                  density="compact"
                  localeText={{
                    MuiTablePagination: {
                      labelRowsPerPage: "Filas por página",
                    },
                  }}
                  sx={{ border: 0 }}
                  loading={isLoading}
                />
              </Paper>
            </div>
            <div className="resume">
              <p>
                <b>Fecha de envío:</b>{" "}
                {translateTimestampToString(
                  history?.licitationDate as number
                ) || "NA"}
              </p>
              <p>
                <b>Envio Gratis:</b> {history?.freeShipping ? "Si" : "No"}
              </p>
              <p>
                <b>Envio Nocturno:</b> {history?.nightShipping ? "Si" : "No"}
              </p>
              <p>
                <b>Plazo para pago:</b> {history?.paymentDays} días.
              </p>
              <p>
                <b>Porcentaje de descuento por pago anticipado:</b>{" "}
                {history?.percentDiscount}%
              </p>
              <p>
                <b>Valor total licitado:</b> {formatToCOP(history?.totalAmount)}
              </p>
            </div>
          </div>
        ) : (
          <p>No hay registros anteriores.</p>
        )}
      </CustomTabPanel>
    </Box>
  );
};
