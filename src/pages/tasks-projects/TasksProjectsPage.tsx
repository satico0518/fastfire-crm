import { useState } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";

import { UserFormComponent } from "../../components/user-form/UserFormComponent";

import { TabPanelProps } from "../../interfaces/Tabs";
import { useUiStore } from "../../stores/ui/ui.store";
import TasksTable from "../../components/table/TasksTableComponent";
import ProjectsTable from "../../components/table/ProjectsTableComponent";
import { ProjectsFormComponent } from "../../components/projects-form/ProjectsFormComponent";
import { TasksFormComponent } from "../../components/tasks-form/TasksFormComponent";

export const TasksPage = () => {
  const [tabsValue, setTabsValue] = useState(0);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);

  const handleTabsChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

  const CustomTabPanel = (props: TabPanelProps) => {
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
          <Tab label="Proyectos" {...a11yProps(1)} />
          {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <TasksTable />
        <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Crear Tarea",
              text: "Ingrese los datos de la nueva tarea.",
              content: <TasksFormComponent />,
            })
          }
          sx={{ color: "white", top: "10px" }}
        >
          <AddTaskOutlinedIcon />
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={1}>
        <ProjectsTable />
        <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Crear Proyecto",
              text: "Ingrese los datos del nuevo proyecto.",
              content: <ProjectsFormComponent />,
            })
          }
          sx={{ color: "white", top: "10px" }}
        >
          <DomainAddOutlinedIcon />
        </Button>
      </CustomTabPanel>
      {/* <CustomTabPanel value={tabsValue} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
