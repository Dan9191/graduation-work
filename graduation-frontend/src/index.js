import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { loadConfig } from "./config/config";
import { initKeycloak } from "./auth/keycloak";
import "./index.css";

const start = async () => {
    await loadConfig();

    try {
        await initKeycloak();
    } catch (e) {
        console.warn("Auth disabled");
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
};

start();