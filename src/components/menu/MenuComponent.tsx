import { NavLink } from "react-router-dom";
import { useAuhtStore } from "../../stores";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';

export const MenuComponent = () => {
  const isAuth = useAuhtStore((state) => state.isAuth);

  if (!isAuth) return null;

  return (
    <div className="menu opened">
      <div className="menu__menu-items">
        <ul>
          <li>
            <NavLink
              to="/tasks"
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "active" : ""
              }
            >
              <TaskAltIcon titleAccess="Proyectos y Tareas" sx={{position: 'relative', top: '6px'}}/> T&P
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/purchasing-manager"
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "active" : ""
              }
            >
              <AddShoppingCartOutlinedIcon titleAccess="Gestor de Compras" sx={{position: 'relative', top: '6px'}}/> Compras
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin"
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "active" : ""
              }
            >
              <BuildCircleOutlinedIcon titleAccess="Administrador" sx={{position: 'relative', top: '6px'}}/> Admin
            </NavLink>
          </li>
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
    </div>
  );
};
