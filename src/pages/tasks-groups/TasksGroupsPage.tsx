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
  const {state} = useLocation();
  
  const [tabsValue, setTabsValue] = useState(state?.goTo === 'wg' ? 1 : 0);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const user = useAuhtStore((state) => state.user);

  useEffect(() => {
    setTabsValue(state?.goTo === 'wg' ? 1 : 0);
  }, [state])

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

  const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    if (!user?.permissions.includes("TYG")) return <UnauthorizedPage />;

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
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          sx={{ backgroundColor: "white" }}
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
        {/* <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nueva Tarea",
              text: "Ingrese los datos de la tarea.",
              content: <TasksFormComponent />,
            })
          }
          sx={{ color: "white", top: "10px" }}
        >
          <AddTaskOutlinedIcon />
        </Button> */}
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={1}>
        <WorksgroupTable />
        <Button
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
          <GroupAddOutlinedIcon />
        </Button>
      </CustomTabPanel>
      {/* <CustomTabPanel value={tabsValue} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
