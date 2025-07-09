import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  userRole: string | null;
  accessToken: string | null;
  login: (token: string, refreshToken: string, role: string) => void;
  logout: () => void;
  roles: { [key: string]: string };
}

const roles = {
  ADMIN: "admin",
  USER: "user",
};

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupération des tokens et rôle
    const storedAccessToken = sessionStorage.getItem("accessToken");
    const storedRefreshToken = sessionStorage.getItem("refreshToken");
    const storedRole = sessionStorage.getItem("userRole");

    if (storedAccessToken && storedRefreshToken && storedRole) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUserRole(storedRole);
    }

    setLoading(false); // Fin du chargement initial
  }, []);

  // Fonction de connexion
  const login = (token: string, refreshToken: string, role: string) => {
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem("userRole", role);

    setAccessToken(token);
    setRefreshToken(refreshToken);
    setUserRole(role);
  };

  // Fonction de rafraîchissement du token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) {
        logout();
        return;
      }

      const response = await fetch("http://localhost:4001/gestionFluxDB/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Échec du rafraîchissement du token");
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      sessionStorage.setItem("accessToken", data.accessToken);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token :", error);
      logout(); // Déconnexion en cas d'échec du refresh
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    // Rafraîchir le token toutes les 15 minutes
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  // Fonction de déconnexion avec redirection
  const logout = async () => {
    try {
      await fetch("http://localhost:4001/gestionFluxDB/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userRole");

    setAccessToken(null);
    setRefreshToken(null);
    setUserRole(null);

    navigate("/"); // Redirection vers la page de connexion
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <AuthContext.Provider value={{ userRole, accessToken, login, logout, roles }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser l'authentification
const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth, roles };