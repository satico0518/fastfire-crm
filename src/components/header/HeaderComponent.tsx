import logo from "../../assets/img/Logo.jpg";
import { useAuhtStore } from "../../stores";
import ProfileMenu from "../profile-menu/ProfileMenuComponent";

type HeaderProps = {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
};

export const Header = ({ isMobileMenuOpen, onToggleMobileMenu }: HeaderProps) => {
  const isAuth = useAuhtStore((state) => state.isAuth);

  if (!isAuth) return null;

  return (
    <div className="header">
      <div className="header__company">
        <button
          className="header__hamburger"
          aria-label="Toggle navigation menu"
          onClick={onToggleMobileMenu}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        <img
          className="header__logo"
          src={logo}
          alt="logo fastfire de colombia"
        />
        <span className="header__text">CRM</span>
      </div>
      <div>
        <div className="header__user">
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
};
