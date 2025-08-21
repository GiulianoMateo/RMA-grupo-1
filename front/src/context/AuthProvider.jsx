import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { createAxiosInstance } from "../services/axiosService";
import { loginUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [permisos, setPermisos] = useState(() => {
    const storedPermisos = localStorage.getItem("permisos");
    return storedPermisos ? JSON.parse(storedPermisos) : [];
  });

  const axiosInstance = createAxiosInstance(() => accessToken);

  const transformPermisos = (permisosList) => {
    return permisosList.reduce((acc, permiso) => {
      acc[permiso] = true;
      return acc;
    }, {});
  };

  const login = (newAccessToken, newRefreshToken, newPermisos) => {
    const permisosDict = transformPermisos(newPermisos);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setPermisos(permisosDict);
    localStorage.setItem("access_token", newAccessToken);
    localStorage.setItem("refresh_token", newRefreshToken);
    localStorage.setItem("permisos", JSON.stringify(permisosDict));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setPermisos([]);
    setUsername(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("permisos");
    setIsAuthenticated(false);
    setLoading(false);
  };

  const verifyAccessToken = async () => {
    if (!accessToken) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const response = await axiosInstance.get("/verify_token");
      setIsAuthenticated(true);
      setUsername(response.data.user);
      return true;
    } catch (err) {
      console.error("Access token no válido:", err);
      setIsAuthenticated(false);
      return false;
    }
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (!storedRefreshToken) {
      console.warn("Intento de refrescar sin refresh token → forzar logout");
      logout();
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/refresh_token`,
        { refresh_token: storedRefreshToken }
      );

      const { access_token: newAccessToken, refresh_token: newRefreshToken } =
        response.data;

      localStorage.setItem("access_token", newAccessToken);
      localStorage.setItem("refresh_token", newRefreshToken);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setIsAuthenticated(true);

      return newAccessToken;
    } catch (err) {
      console.error("Error al refrescar el token:", err);
      logout();
      throw err;
    }
  };

  const verifyOrRefreshToken = async () => {
    try {
      const isAccessTokenValid = await verifyAccessToken();
      if (!isAccessTokenValid) {
        await refreshAccessToken();
      }
    } catch (err) {
      console.error("Error en verifyOrRefreshToken:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginUserWrapper = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(username, password, () => accessToken);
      const { access_token, refresh_token, permisos } = response;
      setUsername(response.user);
      login(access_token, refresh_token, permisos);
    } catch (err) {
      console.error("Error en loginUserWrapper:", err);
      setError(err.message || "Error desconocido al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (accessToken || refreshToken) {
    verifyOrRefreshToken();
  } else {
    setLoading(false);
  }
}, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        username,
        permisos,
        loading,
        error,
        loginUserWrapper,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);