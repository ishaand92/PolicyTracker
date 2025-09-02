// src/services/api.ts
import axios from "axios";

// CRA convention: put REACT_APP_API_BASE in your .env for prod
const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:3001";

// APIs mounted under /api (e.g. /api/policies)
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
});

// APIs mounted at root (e.g. /news)
export const rootApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});
