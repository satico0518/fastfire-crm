import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

import { Header } from "./components/header/HeaderComponent.tsx";
import { MenuComponent } from "./components/menu/MenuComponent.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <div className="body-container">
        <MenuComponent />
        <div className="page-container">
          <App />
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>
);
