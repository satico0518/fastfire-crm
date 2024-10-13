import { Routes, Route } from "react-router-dom";

import { TasksPage } from "../pages/tasks/TasksPage";
import { ProjectsPage } from "../pages/projects/ProjectsPage";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { PurchasingManagerPage } from "../pages/purchasing-manager/PurchasingManagerPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<ProjectsPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/purchasing-manager" element={<PurchasingManagerPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route  path="*" element={<HomePage />} />
    </Routes>
  );
};
