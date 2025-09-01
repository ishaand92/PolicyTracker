import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api", // PROD: read from env
  timeout: 15000,
});
