import axios from "axios";

export const API = "/api";

const client = axios.create({ baseURL: API, timeout: 120000 });

export async function generateAnalogy(payload) {
  const { data } = await client.post("/analogy/generate", payload);
  return data;
}

export async function fetchHistory() {
  const { data } = await client.get("/analogy/history");
  return data;
}

export async function fetchAnalogy(id) {
  const { data } = await client.get(`/analogy/${id}`);
  return data;
}

export async function deleteAnalogy(id) {
  const { data } = await client.delete(`/analogy/${id}`);
  return data;
}
