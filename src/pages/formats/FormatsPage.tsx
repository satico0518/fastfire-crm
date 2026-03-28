import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useAuhtStore } from "../../stores";
import { UnauthorizedPage } from "../unauthorized/UnauthorizedPage";
import { FormatSelector } from "../../components/format-selector/FormatSelector";
import { FormatResultsTable } from "../../components/format-results/FormatResultsTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`formats-tabpanel-${index}`}
      aria-labelledby={`formats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 0, md: 1 }, pt: { xs: 3, md: 2 } }}>{children}</Box>}
    </div>
  );
}

export const FormatsPage = () => {
  const user = useAuhtStore((state) => state.user);
  const isAdmin = user?.permissions.includes("ADMIN");
  const isFormater = user?.permissions.includes("FORMATER");

  const hasAccess = isAdmin || isFormater;
  if (!hasAccess) return <UnauthorizedPage />;

  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          sx={{
            backgroundColor: "white",
            "& .MuiTab-root": {
              fontSize: "0.8rem",
              minHeight: "34px",
              padding: "6px 8px",
              height: "34px",
            },
            "& .MuiTabs-indicator": {
              height: "2px",
            },
          }}
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          variant={window.innerWidth < 768 ? "fullWidth" : "standard"}
        >
          <Tab label="Formatos" id="formats-tab-0" aria-controls="formats-tabpanel-0" />
          {isAdmin && (
            <Tab label="Resultados" id="formats-tab-1" aria-controls="formats-tabpanel-1" />
          )}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <FormatSelector />
      </TabPanel>

      {isAdmin && (
        <TabPanel value={tabValue} index={1}>
          <FormatResultsTable />
        </TabPanel>
      )}
    </Box>
  );
};
