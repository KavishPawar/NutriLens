import axios from "axios";
import { buildApiUrl } from "../../../shared/api.config.js";

const api = axios.create({
  baseURL: buildApiUrl("/api/auth"),
  withCredentials: true,
});

export async function login({ email, password }) {
  const response = await api.post("/login", { email, password });

  return response.data;
}

export async function register({ email, username, password, role }) {
  const response = await api.post("/register", {
    email,
    username,
    password,
    role,
  });

  return response.data;
}

export async function getMe() {
  const response = await api.get("/get-user");

  return response.data;
}

export async function updateProfile({ username, email, goals, theme }) {
  const response = await api.put("/update-user", {
    username,
    email,
    goals,
    theme,
  });

  return response.data;
}

export async function logout() {
  const response = await api.get("/logout");

  return response.data;
}
