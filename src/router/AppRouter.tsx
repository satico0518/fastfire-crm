import { Navigate, Routes, Route } from "react-router-dom";

import { TasksPage } from "../pages/tasks-groups/TasksGroupsPage";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { PurchasingManagerPage } from "../pages/purchasing-manager/PurchasingManagerPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdministratorPage } from "../pages/administrator/AdministratorPage";
import { Backdrop, CircularProgress } from "@mui/material";
import { useUiStore } from "../stores/ui/ui.store";
import ModalComponent from "../components/modal/ModalComponent";
import { SnackbarComponent } from "../components/snackbar/SnackbarComponent";
import { ConfirmationComponent } from "../components/confirmation/ConfirmationComponent";
import { TasksbyGroupPage } from "../pages/tasks-by-group/TasksbyGroupPage";
import { FormatsPage } from "../pages/formats/FormatsPage";
import { AgendaMantenimientosPage } from "../pages/agenda-mantenimientos/AgendaMantenimientosPage";
import { PublicFormatPage } from "../pages/formats/PublicFormatPage";
import { PublicFormatResultsPage } from "../pages/formats/PublicFormatResultsPage";
import { useAuthStore } from "../stores";

export const AppRouter = () => {
  const isLoading = useUiStore(state => state.isLoading);
  const isAuth = useAuthStore(state => state.isAuth);
  const hasHydrated = useAuthStore(state => state.hasHydrated);

  const fallbackRedirect = hasHydrated
    ? <Navigate to={isAuth ? "/home" : "/login"} replace />
    : null;

  return (
    <>
      <Routes>
        <Route path="/" element={fallbackRedirect} />
        <Route element={<ProtectedRoute />}>
          <Route path="/tasks" element={<TasksPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/tasksbygroup" element={<TasksbyGroupPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/purchasing-manager"
            element={<PurchasingManagerPage />}
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdministratorPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/formats" element={<FormatsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/agenda-mantenimientos" element={<AgendaMantenimientosPage />} />
        </Route>
        <Route path="/public-format/:formatId" element={<PublicFormatPage />} />
        <Route path="/public-format-results/:formatId" element={<PublicFormatResultsPage />} />
        <Route path="*" element={fallbackRedirect} />
      </Routes>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <ModalComponent />
      <SnackbarComponent />
      <ConfirmationComponent />
    </>
  );
};
