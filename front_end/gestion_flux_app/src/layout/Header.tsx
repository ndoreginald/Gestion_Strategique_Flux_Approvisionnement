import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  InputBase,
  Badge,
} from "@mui/material";
import { Search, Bell } from "lucide-react";
import ProfileMenu from "../user/ProfileMenu";

interface User {
  nom: string;
  role: string;
}

function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
  
      if (!accessToken) {
        console.error("Token manquant. Veuillez vous reconnecter.");
        return;
      }
  
      try {
        let response = await fetch("http://localhost:4001/gestionFluxDB/users/me/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API :", errorData);
          throw new Error("Erreur lors de la récupération des données");
        }
  
        const data = await response.json();
        console.log("Utilisateur récupéré :", data);
  
        // Modifié ici pour accéder à la bonne structure des données
        setUser({ nom: data.data.email, role: data.data.role }); 
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };
  
    fetchUser();
  }, []);
  
  
  

  return (
    <AppBar position="static" color="default" sx={{ boxShadow: 2, bgcolor: "white" }}>
      <Toolbar>
        {/* Barre de recherche */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "grey.100",
            px: 2,
            py: 1,
            borderRadius: 2,
            flexGrow: 1,
            maxWidth: 400,
          }}
        >
          <Search size={20} style={{ marginRight: 8, color: "#6b7280" }} />
          <InputBase placeholder="Rechercher..." sx={{ flex: 1, fontSize: 14 }} />
        </Box>

        {/* Espacement */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Boutons de menu */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {["Rapports", "Analytics", "Export"].map((item) => (
            <Typography
              key={item}
              variant="body2"
              color="text.primary"
              sx={{
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>

        {/* Espacement */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Icône de Notification */}
        <IconButton>
          <Badge badgeContent={3} color="error">
            <Bell size={20} />
          </Badge>
        </IconButton>

        {/* Profil utilisateur */}
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <Box sx={{ textAlign: "right", mr: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {user?.nom || "Utilisateur"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role || "Rôle inconnu"}
            </Typography>
          </Box>
          <ProfileMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
