import { useState } from "react";
import { TabPanelProps } from "../../interfaces/Tabs";
import { UserFormComponent } from "../user-form/UserFormComponent";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { useUiStore } from "../../stores/ui/ui.store";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import StockTableComponent from "../table/StockTableComponent";
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { StockFormComponent } from "../stock-form/StockFormComponent";

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

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
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
          <Tab label="Ordenes de Compra" {...a11yProps(0)} />
          <Tab label="Licitaciones" {...a11yProps(1)} />
          <Tab label="Inventario" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <h1>Ordenes de Compra</h1>
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
        <h1>Licitaciones</h1>
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
          sx={{ color: "white", top: '10px' }}
        >
          <HandymanOutlinedIcon />
        </Button>
        <Button
          onClick={() => {}}
          sx={{ color: "white", top: '10px' }}
        >
          <UploadFileIcon />
        </Button>
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
