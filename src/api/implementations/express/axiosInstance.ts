import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_EXPRESS_API_URL ?? 'http://localhost:4000/api',
  timeout: 10000
});
