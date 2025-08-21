import axios from "axios";

export const createAxiosInstance = (getToken, refreshAccessToken) => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interceptor para añadir el token en las solicitudes
  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de respuesta para manejar expiración de tokens
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // refrescamos el token usando la función del AuthProvider
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Error al refrescar el token:", refreshError);
          localStorage.clear();
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};