// export const baseUrl = "https://fatima-marketing-backend-production.up.railway.app/api/v1";
// export const baseUrl = "http://localhost:8080/api/v1";

import { productionEnvoirnmentConfig } from "./env.live";
import { stagingEnvoirnmentConfig } from "./env.staging";

const stage = process.env.NODE_ENV;

export const config =
  stage === "production"
    ? productionEnvoirnmentConfig
    : stagingEnvoirnmentConfig;

const { serverUrl } = config;

export const baseUrl = serverUrl;
