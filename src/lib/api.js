import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:47815/api";

export async function apiGet(endpoint) {
  const response = await axios.get(`${API_URL}${endpoint}`);
  return response.data;
}
