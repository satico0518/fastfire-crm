import * as React from "react";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";

import { useUiStore } from "../../stores/ui/ui.store";
import { UserFormComponent } from "../../components/user-form/UserFormComponent";
import { TabPanelProps } from "../../interfaces/Tabs";
import UsersTable from "../../components/table/UsersTableComponent";
import { useAuhtStore } from "../../stores";
import { UnauthorizedPage } from "../unauthorized/UnauthorizedPage";
import ProjectsTable from "../../components/table/ProjectsTableComponent";
import { ProjectsFormComponent } from "../../components/projects-form/ProjectsFormComponent";

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
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const AdministratorPage = () => {
  const [tabsValue, setTabsValue] = React.useState(0);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const user = useAuhtStore((state) => state.user);
  
  if (!user?.permissions?.includes('ADMIN')) return <UnauthorizedPage />

  const handleTabsChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabsValue(newValue);
  };

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
          variant={window.innerWidth < 1101 ? "fullWidth" : "standard"}
        >
          <Tab label="Listado de Usuarios" {...a11yProps(0)} />
          <Tab label="Proyectos" {...a11yProps(1)} />
          {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>
      <CustomTabPanel value={tabsValue} index={0}>
        <UsersTable />
        <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nuevo Usuario",
              text: "Ingrese los datos del usuario y asigne los permisos.",
              content: <UserFormComponent />,
            })
          }
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          size="small"
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: '10px',
            padding: '8px 16px',
            border: '1px solid rgba(10,132,255,0.5)',
            background: 'rgba(10,132,255,0.15)',
            backdropFilter: 'blur(10px)',
            mt: 2,
            '&:hover': {
              background: 'rgba(10,132,255,0.25)',
              border: '1px solid rgba(10,132,255,0.8)',
              boxShadow: '0 0 15px rgba(10,132,255,0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Nuevo Usuario
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={tabsValue} index={1}>
        <ProjectsTable />
        <Button
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nuevo Proyecto",
              text: "Ingrese los datos del proyecto.",
              content: <ProjectsFormComponent />,
            })
          }
          variant="contained"
          startIcon={<DomainAddOutlinedIcon />}
          size="small"
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: '10px',
            padding: '8px 16px',
            border: '1px solid rgba(255,159,10,0.5)',
            background: 'rgba(255,159,10,0.15)',
            backdropFilter: 'blur(10px)',
            mt: 2,
            '&:hover': {
              background: 'rgba(255,159,10,0.25)',
              border: '1px solid rgba(255,159,10,0.8)',
              boxShadow: '0 0 15px rgba(255,159,10,0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Nuevo Proyecto
        </Button>
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel> */}
    </Box>
  );
};
