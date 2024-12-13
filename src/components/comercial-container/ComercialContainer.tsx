import { ChangeEvent, useState } from "react";
import { TabPanelProps } from "../../interfaces/Tabs";
import { UserFormComponent } from "../user-form/UserFormComponent";
import { Box, Tabs, Tab, Button, styled } from "@mui/material";
import { useUiStore } from "../../stores/ui/ui.store";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StockTableComponent from "../table/StockTableComponent";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { StockFormComponent } from "../stock-form/StockFormComponent";
import * as XLSX from "xlsx";
import { PurchaseService } from "../../services/purchase.service";
import { ItemExcel } from "../../interfaces/Item";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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

export const ComercialContainer = () => {
  const [tabsValue, setTabsValue] = useState(0);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const setSnackbar = useUiStore((state) => state.setSnackbar);

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

  const readExcel = (event: ChangeEvent<HTMLInputElement> | null) => {
    const files = event?.target?.files || null;
    if (!files || files.length === 0) return;

    const promise = new Promise<ItemExcel[]>((resolve, reject) => {
      const fr = new FileReader();
      fr.readAsArrayBuffer(files[0]);

      fr.onload = (e) => {
        const ba = e.target?.result;
        const wb = XLSX.read(ba, { type: "buffer" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        resolve(data as ItemExcel[]);
      };

      fr.onerror = (err) => reject(err);
    });

    promise
      .then(async (data: ItemExcel[]) => {
        const requiredKeys = ["codigo", "item", "licitar", "valor", "cantidad"];
        if (!requiredKeys.every((key) => Object.keys(data[0]).includes(key))) {
          setSnackbar({
            open: true,
            message:
              'La tabla no tiene el formato requerido, debe incluir las columnas "licitar", "codigo", "item",  "valor", "cantidad" y no llevar espacios en blanco.',
            severity: "error",
            duration: 10000,
          });
          console.error(
            'La tabla no tiene el formato requerido, debe incluir las columnas "codigo", "item", "licitar", "valor", "cantidad"'
          );
          return;
        }

        const response = await PurchaseService.addStockFromExcel(data);
        if (response.result === "OK") {
          setSnackbar({
            open: true,
            message: response.message as string,
            severity: "success",
          });
        }
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: "Error tratando de cargar el Excel" + JSON.stringify(error),
          severity: "error",
        });
        console.error({ error });
      });
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
          <Tab label="Órdenes de Compra" {...a11yProps(0)} />
          <Tab label="Licitaciones" {...a11yProps(1)} />
          <Tab label="Inventario" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <h1>Órdenes de Compra</h1>
        <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nueva orden de compra",
              text: "Ingrese los datos de la orden de compra.",
              content: <UserFormComponent />,
            })
          }
          sx={{ color: "white", top: "10px" }}
        >
          <DescriptionOutlinedIcon />
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={1}>
        <table border={1}>
          <thead>
            <tr>
              <th rowSpan={2}>Item</th>
              <th colSpan={3}>Proveedores</th>
            </tr>
            <tr>
              <th>Prov 1</th>
              <th>Prov 2</th>
              <th>Prov 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tubo</td>
              <td>2000</td>
              <td>2100</td>
              <td>2200</td>
            </tr>
            <tr>
              <td>Roceador</td>
              <td>5000</td>
              <td>4900</td>
              <td>4850</td>
            </tr>
          </tbody>
        </table>
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={2}>
        <StockTableComponent />
        <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nuevo Item",
              text: "Ingrese los datos del item para agregar al inventario.",
              content: <StockFormComponent />,
            })
          }
          sx={{ color: "white", top: "10px" }}
        >
          <HandymanOutlinedIcon />
        </Button>
        <Button
          className="upload-btn"
          component="label"
          role={undefined}
          variant="text"
          title="Cargar excel"
          sx={{ color: "white", top: "10px" }}
        >
          <UploadFileIcon />
          <VisuallyHiddenInput
            type="file"
            onChange={(e) => readExcel(e || null)}
          />
        </Button>
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
