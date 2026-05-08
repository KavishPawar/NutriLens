import axios from "axios";
import { buildApiUrl } from "../../../shared/api.config.js";

const api = axios.create({
  baseURL: buildApiUrl("/api/admin"),
  withCredentials: true,
});

// ── Products ──────────────────────────────────────────────────────────────────

export async function getAllProducts() {
  const response = await api.get("/products");
  return response.data;
}

export async function addProduct(productData) {
  const response = await api.post("/products", productData);
  return response.data;
}

export async function updateProduct({ id, productData }) {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
}

export async function deleteProduct({ id }) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const response = await api.get("/users");
  return response.data;
}

export async function updateUser({ id, userData }) {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
}

export async function deleteUser({ id }) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

// ── Pending Requests ──────────────────────────────────────────────────────────

export async function getPendingRequests() {
  const response = await api.get("/requests");
  return response.data;
}

export async function approveRequest({ id }) {
  const response = await api.put(`/requests/${id}/approve`);
  return response.data;
}

export async function dismissRequest({ id }) {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
}

// ── Payment ───────────────────────────────────────────────────────────────────

export async function createPaymentIntent({ plan }) {
  const response = await api.post("/payment/intent", { plan });
  return response.data;
}

export async function updateSubscription({ plan }) {
  const response = await api.post("/payment/subscribe", { plan });
  return response.data;
}
