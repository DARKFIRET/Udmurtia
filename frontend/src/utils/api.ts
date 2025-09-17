import axios from "axios";

// Базовый инстанс для API
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // 👈 общий префикс
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Перед каждым запросом добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Неавторизован (401). Возможно, просрочен токен.");
      // можно сделать redirect на /login
    }
    return Promise.reject(error);
  }
);

export default api;
