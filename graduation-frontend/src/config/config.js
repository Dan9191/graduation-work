let config = null;

export const loadConfig = async () => {
    const response = await fetch("/config.json");
    config = await response.json();
};

export const getConfig = () => config;