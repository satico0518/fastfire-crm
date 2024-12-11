import { useState } from "react";
import { TabPanelProps } from "../../interfaces/Tabs";
import { Box, Tabs, Tab } from "@mui/material";
import LicitationTableComponent from "../table/LicitationTableComponent";

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
  // const modal = useUiStore((state) => state.modal);
  // const setModal = useUiStore((state) => state.setModal);

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
          <Tab label="Licitación" {...a11yProps(0)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <LicitationTableComponent />
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
