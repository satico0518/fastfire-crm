import { Button } from '@mui/material';
import logo from '../../assets/img/Logo.jpg'
import userNoImage from '../../assets/img/user-no-image.png'
import { useAuhtStore } from '../../stores';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { deepPurple } from '@mui/material/colors';

export const Header = () => {
  const isAuth = useAuhtStore((state) => state.isAuth);
  const setIsAuth = useAuhtStore((state) => state.setIsAuth);
  const userName = useAuhtStore((state) => state.user?.name);

  if (!isAuth) return null;

  const handleLogOut = () => setIsAuth(false);
  
  return (
  <div className="header">
    <div className='header__company'>
        <img className='header__logo' src={logo} alt='logo fastfire de colombia'/>
        <span className='header__text'>CRM</span>
    </div>
    <div>
        <div className='header__user'>
            <img className='header__user-image' src={userNoImage}/> 
            <span>{userName || 'Usuario no definido'}</span>
            <Button onClick={handleLogOut} title='Salir'>
              <LogoutOutlinedIcon sx={{color: deepPurple[900]}}/>
            </Button>
        </div>
    </div>
  </div>);
};
