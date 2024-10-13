import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

import { Header } from "./components/header/HeaderComponent.tsx";
import { MenuComponent } from "./components/menu/MenuComponent.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Header />
    <div className="main-container">
      <MenuComponent />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  </StrictMode>
);
