import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:4001",
});

export const useApi = () => {
  const { accessToken, login, logout } = useAuth();
  const navigate = useNavigate();

  // Ajouter le token d'authentification aux requêtes
  api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Gestion des erreurs de réponse (ex: token expiré)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si l'erreur est une erreur 401 et que la requête n'a pas déjà été retentée
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Renouveler l'accessToken en utilisant le refreshToken
          const response = await axios.get(
            "http://localhost:4001/gestionFluxDB/refresh-token",
          );

          const newAccessToken = response.data.accessToken;
          const userRole = response.data.user?.role;

          sessionStorage.setItem("accessToken", newAccessToken);

          // Mettre à jour l'accessToken dans le contexte et sessionStorage
          login(newAccessToken, userRole);

          // Mettre à jour le header et renvoyer la requête originale
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Échec du rafraîchissement du token :", refreshError);

          // Si le refreshToken est invalide, déconnecter l'utilisateur
          logout();
          navigate("/", { replace: true });
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export default api;
