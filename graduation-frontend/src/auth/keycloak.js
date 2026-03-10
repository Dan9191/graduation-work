import Keycloak from "keycloak-js";
import { getConfig } from "../config/config";

let keycloak;

export const initKeycloak = () => {
    const kcConfig = getConfig().keycloak;

    keycloak = new Keycloak({
        url: kcConfig.url,
        realm: kcConfig.realm,
        clientId: kcConfig.clientId
    });

    return keycloak.init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        checkLoginIframe: false
    });
};

export const getKeycloak = () => keycloak;