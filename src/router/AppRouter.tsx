import { Routes, Route } from "react-router-dom";

import { TasksPage } from "../pages/tasks/TasksPage";
import { ProjectsPage } from "../pages/projects/ProjectsPage";
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

export const AppRouter = () => {
  const isLoading = useUiStore(state => state.isLoading);

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/tasks" element={<TasksPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<ProjectsPage />} />
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
          <Route path="*" element={<LoginPage />} />
        </Route>
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
