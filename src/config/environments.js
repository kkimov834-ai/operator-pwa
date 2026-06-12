export const APP_CONFIG_BY_ENV = {
    development: {
        apiBaseUrl: "https://api.akul.az/devgate/",
        authBaseUrl: "https://auth.beinsystems.az",
    },
    production: {
        apiBaseUrl: "https://api.akul.az/gate/",
        authBaseUrl: "https://auth.beinsystems.az",
    },
};

export function getConfigForMode(mode) {
    return mode === "production"
        ? APP_CONFIG_BY_ENV.production
        : APP_CONFIG_BY_ENV.development;
}

export const appConfig = {
    ...APP_CONFIG_BY_ENV.development,
    ...(typeof window !== "undefined" ? window.__APP_CONFIG__ : {}),
};
