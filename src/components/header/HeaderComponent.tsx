import logo from '../../assets/img/Logo.jpg'
import userNoImage from '../../assets/img/user-no-image.png'

export const Header = () => {
  const userName = 'Davo Gomez';
  return (
  <div className="header">
    <div className='header__company'>
        <img className='header__logo' src={logo} alt='logo fastfire de colombia'/>
        <span className='header__text'>CRM</span>
    </div>
    <div>
        <div className='header__user'>
            <img className='header__user-image' src={userNoImage}/> 
            <span>{userName}</span>
        </div>
    </div>
  </div>);
};
