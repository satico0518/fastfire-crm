import React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import PasswordOutlinedIcon from "@mui/icons-material/PasswordOutlined";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import { Chip } from "@mui/material";
import { getUserNameByKey } from "../../utils/utils";
import { useAuhtStore } from "../../stores";
import { useUsersStore } from "../../stores/users/users.store";
import { User } from "../../interfaces/User";
import { useUiStore } from "../../stores/ui/ui.store";
import { AuthService } from "../../services/auth.service";
import { ColorPickerComponent } from "../color-picker/ColorPickerComponent";
import { ColorResult } from "react-color";
import { UsersService } from "../../services/users.service";
import CloudinaryUploadWidget from "../cloudinary/CloudinaryWidget";

export default function ProfileMenu() {
  const users = useUsersStore((state) => state.users);
  const currentUser = useAuhtStore((state) => state.user);
  const setNewUser = useAuhtStore((state) => state.setNewUser);
  const setIsAuth = useAuhtStore((state) => state.setIsAuth);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isColorVisible, setIsColorVisible] = useState<boolean>(false);
  const open = Boolean(anchorEl);

  const [uwConfig] = useState({
    cloudName: "fastfire",
    uploadPreset: "vr0sleie",
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = async () => {
    try {
      if (currentUser && currentUser.email) {
        const resp = await AuthService.changePassword(currentUser?.email);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: `Revisa tu correo "${currentUser.email}", se te ha enviado un link para cambiar tu contraseña. Deberás iniciar sesión nuevamente, si no modificaste la contraseña ingresa con la que ya usabas.`,
            severity: "success",
            duration: 20000,
          });
          handleLogOut();
          return;
        }

        return setSnackbar({
          open: true,
          message: `Error tratando de enviar el correo a "${currentUser.email}" para cambio de contraseña.`,
          severity: "error",
          duration: 10000,
        });
      } else
        setSnackbar({
          open: true,
          message: `No se encontró un correo válido para enviar el link de cambio de contraseña.`,
          severity: "error",
          duration: 10000,
        });
    } catch (error) {
      console.error(
        `Error tratando de enviar el correo a "${
          currentUser?.email || "NA"
        }" para cambio de contraseña.`,
        { error }
      );
      setSnackbar({
        open: true,
        message: `Error tratando de enviar el correo a "${
          currentUser?.email || "NA"
        }" para cambio de contraseña.`,
        severity: "error",
        duration: 10000,
      });
    }
  };

  const handleLogOut = async () => {
    setIsLoading(true);
    const response = await AuthService.LogOut();
    if (response?.result === "OK") setIsAuth(false);
    else {
      setSnackbar({
        open: true,
        severity: "error",
        message: response.errorMessage ?? "Error cerrando sesión!",
      });
    }

    setIsLoading(false);
  };

  const handleChangeColor = async (color: ColorResult) => {
    if (currentUser) {
      currentUser.color = color.hex;
      UsersService.modifyUser(currentUser);
      setNewUser({ ...currentUser, color: color.hex });
      setIsColorVisible(false);
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <>
          <Chip
            avatar={
              <Tooltip title="Configuración de la cuenta">
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  {currentUser?.avatarURL ? (
                    <Avatar
                      src={currentUser.avatarURL}
                      sx={{
                        position: "relative",
                        right: "10px",
                        border: "solid #FFF 2px",
                      }}
                    />
                  ) : currentUser?.permissions.includes("PROVIDER") ? (
                    <StoreOutlinedIcon sx={{ color: "white" }} />
                  ) : (
                    <Avatar
                      sx={{ width: 25, height: 25, color: currentUser?.color }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              //   <Avatar alt={getUserNameByKey(currentUserKey as string, users as User[])} src={userNoImage} />
            }
            label={getUserNameByKey(
              currentUser?.key as string,
              users as User[]
            )}
            variant="outlined"
            sx={{ color: "white", fontSize: "15px", fontWeight: "600" }}
          />
        </>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => {}}>
          <Avatar
            sx={{ color: currentUser?.color }}
            src={currentUser?.avatarURL}
          />{" "}
          {currentUser?.avatarURL ? "Editar Foto" : "Agregar foto"}
          <CloudinaryUploadWidget uwConfig={uwConfig} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsColorVisible(true);
            handleClose();
          }}
        >
          <ColorLensOutlinedIcon
            sx={{ color: currentUser?.color || "#f3f3f3" }}
          />{" "}
          <span style={{ marginLeft: "10px" }}>
            {currentUser?.color ? "Cambiar mi color" : "Definir mi color"}
          </span>
        </MenuItem>
        <MenuItem onClick={handleChangePassword}>
          <PasswordOutlinedIcon />{" "}
          <span style={{ marginLeft: "10px" }}>Cambiar contraseña</span>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Salir
        </MenuItem>
      </Menu>
      <ColorPickerComponent
        visible={isColorVisible}
        handleChange={handleChangeColor}
      />
    </React.Fragment>
  );
}
