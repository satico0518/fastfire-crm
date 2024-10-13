import { Routes, Route } from "react-router-dom"

import { TasksPage } from "../pages/tasks/TasksPage"
import { ProjectsPage } from "../pages/projects/ProjectsPage"
import { HomePage } from "../pages/home/HomePage"
import { LoginPage } from "../pages/login/LoginPage"
import { PurchasingManagerPage } from "../pages/purchasing-manager/PurchasingManagerPage"


export const AppRouter = () => {
  return (
    <Routes>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/purchasing-manager" element={<PurchasingManagerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
