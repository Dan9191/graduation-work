import Keycloak from "keycloak-js";
import { getConfig } from "../config/config";

let keycloak;

export const initKeycloak = async () => {
    const kcConfig = getConfig().keycloak;

    keycloak = new Keycloak({
        url: kcConfig.url,
        realm: kcConfig.realm,
        clientId: kcConfig.clientId
    });

    try {
        return await keycloak.init({
            onLoad: "check-sso",
            pkceMethod: "S256",
            checkLoginIframe: false,
            silentCheckSsoRedirectUri:
            window.location.origin + "/silent-check-sso.html"
        });
    } catch (e) {
        console.warn("Keycloak unavailable, continuing without auth");
        return false;
    }
};

export const getKeycloak = () => keycloak;