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

const Main = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((s) => !s)}
      />

      <div className="body-container">
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Main />
  </StrictMode>
);
