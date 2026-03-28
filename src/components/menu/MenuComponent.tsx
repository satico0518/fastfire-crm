import { NavLink, useNavigate } from "react-router-dom";
import { useAuhtStore } from "../../stores";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import SecondaryActions, {
  SecondaryActionsProps,
} from "../menu-secondary/SecondaryActions";
import { useUiStore } from "../../stores/ui/ui.store";
import { WorkgroupsFormComponent } from "../workgroups-form/WorkgroupsFormComponent";
import { Button, Tooltip, IconButton, Box } from "@mui/material";
import { TasksFormComponent } from "../tasks-form/TasksFormComponent";
import { Workgroup } from "../../interfaces/Workgroup";
import { WorkgroupService } from "../../services/workgroup.service";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Task } from "../../interfaces/Task";
import { useUsersStore } from "../../stores/users/users.store";
import { User } from "../../interfaces/User";

type MenuComponentProps = {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
};

export const MenuComponent = ({
  isMobileMenuOpen,
  onCloseMobileMenu,
}: MenuComponentProps) => {
  const navigate = useNavigate();
  const isAuth = useAuhtStore((state) => state.isAuth);
  const currentUser = useAuhtStore((state) => state.user);
  const hasHydrated = useAuhtStore((state) => state.hasHydrated);
  
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const setIsSidebarCollapsed = useUiStore((state) => state.setIsSidebarCollapsed);

  // No renderizar hasta que el store esté hidratado
  if (!hasHydrated) {
    return null;
  }
  
  const isAdmin = currentUser?.permissions.includes("ADMIN");
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const setModal = useUiStore((state) => state.setModal);
  const modal = useUiStore((state) => state.modal);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const tasks = useTasksStore((state) => state.tasks);
  const users = useUsersStore((state) => state.users);

  if (!isAuth) return null;
  const closeOnMobile = () => {
    if (isMobileMenuOpen) onCloseMobileMenu();
  };

  const workgroupsByRole = (): Workgroup[] => {
    if (isAdmin) return workgroups?.filter((wg) => wg.isActive) as Workgroup[];
    return workgroups
      ?.filter(
        (wg) =>
          currentUser?.workgroupKeys.some((key) => wg.key === key) ||
          !wg.isPrivate
      )
      .filter((wg) => wg.isActive) as Workgroup[];
  };

  const SECONDARY_ACTIONS_OPTIONS: SecondaryActionsProps = {
    options: [
      {
        icon: <AddOutlinedIcon />,
        label: "Nuevo grupo",
        action: () => {
          setModal({
            ...modal,
            open: true,
            title: "Nuevo Grupo",
            text: "Un grupo repesenta a los equipos o departamentos de la empresa.",
            content: <WorkgroupsFormComponent />,
          });
        },
      },
    ],
  };

  const handleDeleteGroup = async (workgroup: Workgroup) => {
    try {
      const resp = await WorkgroupService.deleteWorkgroup(
        workgroup,
        tasks as Task[],
        users as User[]
      );
      if (resp.result === "OK") {
        setSnackbar({
          open: true,
          message: "Grupo y tareas eliminados correctamente!",
          severity: "success",
        });
        navigate("/home");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error eliminando grupo!",
        severity: "error",
      });
    } finally {
      setConfirmation({ open: false });
    }
  };

  const getGroupSecondaryActions = (
    workgroup: Workgroup
  ): SecondaryActionsProps => ({
    options: [
      {
        icon: <AddOutlinedIcon />,
        label: "Nueva Tarea",
        action: () => {
          setModal({
            ...modal,
            open: true,
            title: "Nueva Tarea",
            content: (
              <TasksFormComponent workgroupKey={workgroup.key as string} />
            ),
          });
        },
      },
      {
        icon: <ModeEditOutlineOutlinedIcon fontSize="small" />,
        label: "Modificar",
        action: () => {
          setModal({
            ...modal,
            open: true,
            title: "Modificar Grupo",
            content: <WorkgroupsFormComponent editingGroup={workgroup} />,
          });
        },
      },
      {
        icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
        label: "Eliminar",
        action: () =>
          setConfirmation({
            open: true,
            title: "Confirmación!",
            text: `Vas a eliminar el grupo "${workgroup.name.toUpperCase()}"`,
            actions: (
              <Button onClick={() => handleDeleteGroup(workgroup)}>
                Eliminar
              </Button>
            ),
          }),
      },
    ],
  });

  return (
    <div className={`menu ${isMobileMenuOpen ? "menu--open" : ""} ${isSidebarCollapsed ? "menu--collapsed" : ""}`}>
      
      {/* Sidebar Toggle - Only on Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: isSidebarCollapsed ? 'center' : 'flex-end', mb: 1 }}>
        <IconButton 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          size="small"
          sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          {isSidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>

      <div className="menu__menu-items">
        <ul>
          {currentUser?.permissions.includes("ADMIN") && (
            <li>
              <Tooltip title={isSidebarCollapsed ? "T&G" : ""} placement="right" arrow>
                <NavLink
                  to="/tasks"
                  onClick={closeOnMobile}
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  <TaskAltIcon />
                  {!isSidebarCollapsed && <span>T&G</span>}
                </NavLink>
              </Tooltip>
            </li>
          )}
          {(currentUser?.permissions.includes("PURCHASE") ||
            currentUser?.permissions.includes("PROVIDER")) && (
            <li>
              <Tooltip title={isSidebarCollapsed ? (currentUser?.permissions.includes("PROVIDER") ? "Cotización" : "Comercial") : ""} placement="right" arrow>
                <NavLink
                  to="/purchasing-manager"
                  onClick={closeOnMobile}
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  {currentUser?.permissions.includes("PROVIDER") ? (
                    <RequestQuoteOutlinedIcon />
                  ) : (
                    <ShoppingCartOutlinedIcon />
                  )}
                  {!isSidebarCollapsed && (
                    <span>
                      {currentUser?.permissions.includes("PROVIDER") ? "Cotización" : "Comercial"}
                    </span>
                  )}
                </NavLink>
              </Tooltip>
            </li>
          )}
          {currentUser?.permissions.includes("ADMIN") && (
            <li>
              <Tooltip title={isSidebarCollapsed ? "Admin" : ""} placement="right" arrow>
                <NavLink
                  to="/admin"
                  onClick={closeOnMobile}
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  <BuildCircleOutlinedIcon />
                  {!isSidebarCollapsed && <span>Admin</span>}
                </NavLink>
              </Tooltip>
            </li>
          )}
          {!currentUser?.permissions.includes("PROVIDER") && (
            <li>
              <Tooltip title={isSidebarCollapsed ? "Formatos" : ""} placement="right" arrow>
                <NavLink
                  to="/formats"
                  onClick={closeOnMobile}
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  <ArticleOutlinedIcon />
                  {!isSidebarCollapsed && <span>Formatos</span>}
                </NavLink>
              </Tooltip>
            </li>
          )}
          {(currentUser?.permissions.includes("ADMIN") || currentUser?.permissions.includes("PLANNER")) && (
            <li>
              <Tooltip title={isSidebarCollapsed ? "Agenda" : ""} placement="right" arrow>
                <NavLink
                  to="/agenda-mantenimientos"
                  onClick={closeOnMobile}
                  className={({ isActive }) => isActive ? "active" : ""}
                >
                  <CalendarMonthOutlinedIcon />
                  {!isSidebarCollapsed && <span>Agenda Mantenimientos</span>}
                </NavLink>
              </Tooltip>
            </li>
          )}
        </ul>
      </div>

      <div className="menu__workgroups">
        <div className="menu__workgroups-title">
          {!isSidebarCollapsed && <span>Grupos</span>}
          {isAdmin && !isSidebarCollapsed && (
            <div className="menu__workgroups-title-actions">
              <SecondaryActions options={SECONDARY_ACTIONS_OPTIONS.options} />
            </div>
          )}
        </div>
        <ul>
          {isAdmin && (
            <li>
              <Tooltip title={isSidebarCollapsed ? "Todas las tareas" : ""} placement="right" arrow>
                <Button
                  fullWidth={!isSidebarCollapsed}
                  sx={{ color: "white", justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', minWidth: 0, px: isSidebarCollapsed ? 0 : 2 }}
                  onClick={() => {
                    navigate("/tasks");
                    closeOnMobile();
                  }}
                >
                  <FormatListBulletedOutlinedIcon />
                  {!isSidebarCollapsed && <Box sx={{ ml: 1, textTransform: 'none' }}>Ver todas las tareas</Box>}
                </Button>
              </Tooltip>
            </li>
          )}
          {!currentUser?.permissions.includes("PROVIDER") &&
          workgroupsByRole().length > 0 ? (
            workgroupsByRole().map((wg) => (
              <li key={wg.id}>
                <Tooltip title={isSidebarCollapsed ? wg.name : ""} placement="right" arrow>
                  <div className="menu__workgroup-item">
                    <div
                      className="menu__workgroup-item-icon"
                      style={{ 
                        backgroundColor: wg.color ? wg.color : "#8a8282",
                        margin: isSidebarCollapsed ? '0 auto' : '0 10px 0 0',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        navigate("/tasksbygroup", { state: { wg } });
                        closeOnMobile();
                      }}
                    >
                      {wg.name.charAt(0).toUpperCase()}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="menu__workgroups-title" style={{ marginTop: 0 }}>
                        <span
                          className="menu__workgroups-title-text"
                          onClick={() => {
                            navigate("/tasksbygroup", { state: { wg } });
                            closeOnMobile();
                          }}
                        >
                          {wg.name.charAt(0).toUpperCase() + wg.name.substring(1).toLowerCase()}
                          {!wg.isPrivate && (
                            <PublicOutlinedIcon
                              sx={{
                                fontSize: "15px",
                                marginLeft: "10px",
                                top: "2px",
                                color: "#b8d2e9",
                              }}
                            />
                          )}
                        </span>
                        <SecondaryActions options={getGroupSecondaryActions(wg).options} />
                      </div>
                    )}
                  </div>
                </Tooltip>
              </li>
            ))
          ) : !isSidebarCollapsed && (
            <li style={{ padding: '0 10px', fontSize: '0.8rem', opacity: 0.6 }}>Sin asignación</li>
          )}
          {isAdmin && !isSidebarCollapsed && (
            <>
              <li>
                <Button
                  fullWidth
                  sx={{ color: "white", justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => {
                    navigate("/tasks", { state: { goTo: "wg" } });
                    closeOnMobile();
                  }}
                >
                  <FormatListBulletedOutlinedIcon sx={{ mr: 1 }} />
                  Ver Grupos
                </Button>
              </li>
              <li>
                <Button
                  fullWidth
                  sx={{ color: "white", justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() =>
                    setModal({
                      ...modal,
                      open: true,
                      title: "Nuevo Grupo",
                      content: <WorkgroupsFormComponent />,
                    })
                  }
                >
                  <AddOutlinedIcon sx={{ mr: 1 }} />
                  Crear Grupo
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
