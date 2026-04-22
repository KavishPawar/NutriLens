import axios from "axios";

const api = axios.create({
  baseURL: "/api/product",
  withCredentials: true,
});

export async function fetchProd({ barcode }) {
  const response = await api.get(`/fetch/${barcode}`);

  return response.data;
}

export async function prodHistory() {
  const response = await api.get("/history");

  return response.data;
}

export async function deleteHistory({ userId }) {
  const response = await api.delete(`/history/delete/${userId}`)

  return response.data;
}