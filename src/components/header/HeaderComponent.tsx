import { Avatar, Button, Chip } from "@mui/material";
import logo from "../../assets/img/Logo.jpg";
import userNoImage from "../../assets/img/user-no-image.png";
import { useAuhtStore } from "../../stores";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export const Header = () => {
  const isAuth = useAuhtStore((state) => state.isAuth);
  const setIsAuth = useAuhtStore((state) => state.setIsAuth);
  const firstName = useAuhtStore((state) => state.user?.firstName);
  const lastName = useAuhtStore((state) => state.user?.lastName);

  if (!isAuth) return null;

  const handleLogOut = () => setIsAuth(false);

  return (
    <div className="header">
      <div className="header__company">
        <img
          className="header__logo"
          src={logo}
          alt="logo fastfire de colombia"
        />
        <span className="header__text">CRM</span>
      </div>
      <div>
        <div className="header__user">
          <Chip
            avatar={<Avatar alt={`${firstName} ${lastName}`} src={userNoImage} />}
            label={`${firstName} ${lastName}`}
            variant="outlined"
            sx={{color: 'white'}}
          />
          <Button onClick={handleLogOut} title="Salir">
            <LogoutOutlinedIcon sx={{ color: 'white' }} />
          </Button>
        </div>
      </div>
    </div>
  );
};
