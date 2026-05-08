const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE_URL = rawApiBaseUrl.trim().replace(/\/$/, "");

export function buildApiUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with '/': ${path}`);
  }
  return `${API_BASE_URL}${path}`;
}

