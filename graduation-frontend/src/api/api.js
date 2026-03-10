import axios from "axios";
import { getConfig } from "../config/config";
import { getKeycloak } from "../auth/keycloak";

let api;

export const getApi = () => {
    if (!api) {
        api = axios.create({
            baseURL: getConfig().apiUrl
        });

        api.interceptors.request.use(async (config) => {
            const keycloak = getKeycloak();
            if (keycloak?.authenticated) {
                await keycloak.updateToken(30);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            }
            return config;
        });
    }
    return api;
};