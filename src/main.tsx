import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import { SettingsProvider } from "./utils/SettingsContext";
import { PasswordGate } from "./components/PasswordGate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PasswordGate>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </PasswordGate>
  </StrictMode>,
);
