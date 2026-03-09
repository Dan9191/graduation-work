import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { loadConfig } from "./config/config";
import { initKeycloak } from "./auth/keycloak";
import "./index.css";

const start = async () => {
    await loadConfig();
    await initKeycloak();

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<App />);
};

start();