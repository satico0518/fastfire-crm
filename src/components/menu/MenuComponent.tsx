import { IconButton } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { NavLink } from "react-router-dom";
import { useState } from "react";

export const MenuComponent = () => {
  const [isClosing, setIsClosing] = useState(false);

  const handleToggleMenu = () => {
    setIsClosing((isClosing) => !isClosing);
  };

  return (
    <div className={isClosing ? 'menu closed' : 'menu'}>
      <div className="menu__menu-items">
        <ul>
          <li>
            <NavLink
              to="/tasks"
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "active" : ""
              }
            >
              {isClosing ? <TaskAltIcon /> : "Proyectos y Tareas"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/purchasing-manager"
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "active" : ""
              }
            >
              {isClosing ? <AddShoppingCartOutlinedIcon /> : "Gestor de Compras"}
            </NavLink>
          </li>
          {/* <li>
          <NavLink
            to="/login"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }
          >
            Login
          </NavLink>
        </li>
        <li>
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
      <div className="menu__btn-close-menu">
        <IconButton
          onClick={handleToggleMenu}
          aria-label="delete"
        >
          {isClosing ? (
            <ArrowForwardIos sx={{ color: deepPurple[900] }} />
          ) : (
            <ArrowBackIos className="menu__back-icon" sx={{ color: deepPurple[900] }} />
          )}
        </IconButton>
      </div>
    </div>
  );
};
