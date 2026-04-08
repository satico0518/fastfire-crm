import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

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

export const Main = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </BrowserRouter>
  );
};

const rootEl = document.getElementById("root");
/* istanbul ignore next -- createRoot solo en runtime fuera de Jest */
if (rootEl && process.env.JEST_WORKER_ID === undefined) {
  createRoot(rootEl).render(
    <StrictMode>
      <Main />
    </StrictMode>
  );
}
