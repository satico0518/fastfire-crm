import { useEffect, useState } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";

import { TabPanelProps } from "../../interfaces/Tabs";
import { useUiStore } from "../../stores/ui/ui.store";
import TasksTable from "../../components/table/TasksTableComponent";
import { useAuhtStore } from "../../stores";
import { UnauthorizedPage } from "../unauthorized/UnauthorizedPage";
import WorksgroupTable from "../../components/table/WorkgroupsTableComponent";
import { WorkgroupsFormComponent } from "../../components/workgroups-form/WorkgroupsFormComponent";
import { useLocation } from "react-router-dom";

export const TasksPage = () => {
  const { state } = useLocation();

  const [tabsValue, setTabsValue] = useState(state?.goTo === "wg" ? 1 : 0);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const user = useAuhtStore((state) => state.user);
  const hasHydrated = useAuhtStore((state) => state.hasHydrated);
  
  // No renderizar hasta que el store esté hidratado
  if (!hasHydrated) {
    return null;
  }

  useEffect(() => {
    setTabsValue(state?.goTo === "wg" ? 1 : 0);
  }, [state]);

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

  const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    if (!user?.permissions?.includes("TYG")) return <UnauthorizedPage />;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: { xs: 0.5, md: 1 } }}>{children}</Box>}
      </div>
    );
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "rgba(255,255,255,0.1)" }}>
        <Tabs
          sx={{
            backgroundColor: "rgba(28, 28, 30, 0.8)",
            "& .MuiTab-root": {
              fontSize: "0.82rem",
              minHeight: "34px",
              padding: "6px 8px",
              height: "34px",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 700
            },
            "& .Mui-selected": { color: "#0a84ff !important" },
            "& .MuiTabs-indicator": {
              height: "2px",
              backgroundColor: "#0a84ff"
            },
          }}
          value={tabsValue}
          onChange={handleTabsChange}
          aria-label="basic tabs example"
        >
          <Tab label="Tareas" {...a11yProps(0)} />
          <Tab label="Grupos de trabajo" {...a11yProps(1)} />
          {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <TasksTable />
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={1}>
        <WorksgroupTable />
        <Button
          startIcon={<GroupAddOutlinedIcon />}
          title="Crear nuevo grupo de trabajo"
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nuevo Grupo de trabajo",
              text: "Ingrese los datos del nuevo grupo.",
              content: <WorkgroupsFormComponent />,
            })
          }
          sx={{ color: "white", top: "10px" }}
        >
          Nuevo Grupo
        </Button>
      </CustomTabPanel>
      {/* <CustomTabPanel value={tabsValue} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
