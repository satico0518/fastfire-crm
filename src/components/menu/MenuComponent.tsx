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
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import SecondaryActions, {
  SecondaryActionsProps,
} from "../menu-secondary/SecondaryActions";
import { useUiStore } from "../../stores/ui/ui.store";
import { WorkgroupsFormComponent } from "../workgroups-form/WorkgroupsFormComponent";
import { Button } from "@mui/material";
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
            text: "Un grupo repesenta a los equipos o departamentos de la empresa, cada uno con sus propias listas, flujos de trabajo y ajustes.",
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
      } else {
        setSnackbar({
          open: true,
          message: "Error eliminando grupo!",
          severity: "error",
        });
        console.error("Error eliminando grupo!");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error eliminando grupo!",
        severity: "error",
      });
      console.error("Error eliminando grupo!", { error });
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
            text: "Ingrese los datos de la nueva tarea.",
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
            text: "Modifique los campos necesarios para editar el grupo.",
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
            text: `Vas a eliminar el grupo "${workgroup.name.toUpperCase()}" y todas sus tareas.`,
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
    <div className={`menu ${isMobileMenuOpen ? "menu--open" : ""}`}>
      <div className="menu__menu-items">
        <ul>
          {currentUser?.permissions.includes("ADMIN") && (
            <li>
              <NavLink
                to="/tasks"
                onClick={closeOnMobile}
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                <TaskAltIcon
                  titleAccess="Tareas y Grupos de Trabajo"
                  sx={{ position: "relative", top: "6px" }}
                />{" "}
                T&G
              </NavLink>
            </li>
          )}
          {(currentUser?.permissions.includes("PURCHASE") ||
            currentUser?.permissions.includes("PROVIDER")) && (
            <li>
              <NavLink
                to="/purchasing-manager"
                onClick={closeOnMobile}
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                {currentUser?.permissions.includes("PROVIDER") ? (
                  <RequestQuoteOutlinedIcon titleAccess="Órdenes de Compra" sx={{ position: "relative", top: "6px" }}/>
                ) : (
                  <>
                    <ShoppingCartOutlinedIcon titleAccess="Comercial" sx={{ position: "relative", top: "6px" }}
                    />{" "}
                  </>
                )}
                {currentUser?.permissions.includes("PROVIDER")
                  ? "Cotización"
                  : "Comercial"}
              </NavLink>
            </li>
          )}
          {currentUser?.permissions.includes("ADMIN") && (
            <li>
              <NavLink
                to="/admin"
                onClick={closeOnMobile}
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                <BuildCircleOutlinedIcon
                  titleAccess="Administrador"
                  sx={{ position: "relative", top: "6px" }}
                />{" "}
                Admin
              </NavLink>
            </li>
          )}
          {/* <li>
          <NavLink
            to="/home"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
          >
            Inicio
          </NavLink>
        </li> */}
        </ul>
      </div>
      <div className="menu__workgroups">
        <div className="menu__workgroups-title">
          <span>Grupos</span>
          {isAdmin && (
            <div className="menu__workgroups-title-actions">
              <SecondaryActions options={SECONDARY_ACTIONS_OPTIONS.options} />
            </div>
          )}
        </div>
        <ul>
          {isAdmin && (
            <li>
              <Button
                sx={{ color: "white" }}
                title="Crear grupo"
                startIcon={<FormatListBulletedOutlinedIcon />}
                onClick={() => {
                  navigate("/tasks");
                  closeOnMobile();
                }}
              >
                Ver todas las tareas
              </Button>
            </li>
          )}
          {!currentUser?.permissions.includes("PROVIDER") &&
          workgroupsByRole().length > 0 ? (
            workgroupsByRole().map((wg) => (
              <li key={wg.id}>
                <div key={wg.id} className="menu__workgroup-item">
                  <div
                    className="menu__workgroup-item-icon"
                    style={{ backgroundColor: wg.color ? wg.color : "#8a8282" }}
                  >
                    {wg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="menu__workgroups-title">
                    <span
                      className="menu__workgroups-title-text"
                      onClick={() => {
                        navigate("/tasksbygroup", { state: { wg } });
                        closeOnMobile();
                      }}
                    >
                      {wg.name.charAt(0).toUpperCase() +
                        wg.name.substring(1).toLowerCase()}
                      {!wg.isPrivate && (
                        <PublicOutlinedIcon
                          titleAccess="Público"
                          sx={{
                            fontSize: "15px",
                            marginLeft: "10px",
                            top: "2px",
                            color: "#b8d2e9",
                          }}
                        />
                      )}
                    </span>
                    <SecondaryActions
                      options={getGroupSecondaryActions(wg).options}
                    />
                  </div>
                </div>
              </li>
            ))
          ) : (
            <span>Sin asignación de grupos</span>
          )}
          {isAdmin && (
            <>
              <li>
                <Button
                  sx={{ color: "white" }}
                  title="Crear grupo"
                  startIcon={<FormatListBulletedOutlinedIcon />}
                  onClick={() => {
                    navigate("/tasks", { state: { goTo: "wg" } });
                    closeOnMobile();
                  }}
                >
                  Ver Grupos
                </Button>
              </li>
              <li>
                <Button
                  sx={{ color: "white" }}
                  title="Crear grupo"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() =>
                    setModal({
                      ...modal,
                      open: true,
                      title: "Nuevo Grupo",
                      text: "Un grupo repesenta a los equipos o departamentos de la empresa, cada uno con sus propias listas, flujos de trabajo y ajustes.",
                      content: <WorkgroupsFormComponent />,
                    })
                  }
                >
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
