import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

import { Header } from "./components/header/HeaderComponent.tsx";
import { MenuComponent } from "./components/menu/MenuComponent.tsx";
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        uwConfig: unknown,
        func: unknown,
        // options: unknown,
      ) => {open: () => void};
    };
  }
}

import { useUiStore } from "./stores/ui/ui.store";
import { useAuthStore } from "./stores";

const PUBLIC_SHELL_HIDDEN_ROUTES = ["/login", "/public-format", "/public-format-results"];

const shouldHidePrivateShell = (pathname: string) => {
  return PUBLIC_SHELL_HIDDEN_ROUTES.some((route) => pathname.startsWith(route));
};

const MainContent = () => {
  const location = useLocation();
  const isAuth = useAuthStore((state) => state.isAuth);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  const showPrivateShell = hasHydrated && isAuth && !shouldHidePrivateShell(location.pathname);

  if (!showPrivateShell) {
    return <App />;
  }

  return (
    <>
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((s) => !s)}
      />

      <div className={`body-container ${isSidebarCollapsed ? 'body-container--collapsed' : ''}`}>
        <MenuComponent
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        <div className="page-container">
          <App />
        </div>

        {isMobileMenuOpen && (
          <div
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export const Main = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MainContent />
    </BrowserRouter>
  );
};

const rootEl = document.getElementById("root");
/* istanbul ignore next -- createRoot solo en runtime fuera de Jest */
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <Main />
    </StrictMode>
  );
}
