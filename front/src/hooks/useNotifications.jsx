import { useState, useEffect } from "react";
import { useAxios } from "../context/AxiosProvider";
import { useAuth } from "../context/AuthProvider";

const baseURL = import.meta.env.VITE_API_URL;

export const useNotifications = ({ count_limit, shouldReload }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadPresent, setUnreadPresent] = useState(false);

  const axios = useAxios();
  const { isAuthenticated } = useAuth(); // 👈 traemos el estado de login

  useEffect(() => {
    if (!isAuthenticated) {
      // 🚀 si no está autenticado, no hacemos la request
      setNotificaciones([]);
      setUnreadPresent(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(baseURL + "/usernotifications", {
        params: { count_limit },
      })
      .then((res) => {
        const data = res.data;

        if (Array.isArray(data)) {
          setNotificaciones(data);
          setUnreadPresent(data.some((noti) => !noti.is_read));
        } else {
          console.warn("Respuesta inesperada en notificaciones:", data);
          setNotificaciones([]);
          setUnreadPresent(false);
        }

        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, [isAuthenticated, count_limit, shouldReload]); // 👈 dependencia de auth

  return {
    notificaciones,
    loadingNotifications: loading,
    error,
    unreadPresent,
  };
};