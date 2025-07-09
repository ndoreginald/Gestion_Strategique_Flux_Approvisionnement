import React, { useState } from "react";
import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { Person, Settings, Logout } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); 
  const { logout , userRole} = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

     // Fonction de déconnexion
      const handleLogout = async () => {
        const refreshToken = sessionStorage.getItem("refreshToken");
        const accessToken = sessionStorage.getItem("accessToken");
        if (!refreshToken) {
          console.error("refreshToken Token manquant ou invalide");
          return;
        }
        try {
            await axios.post(
                "http://localhost:4001/gestionFluxDB/logout",
                {},  // Si le token est géré côté backend via cookies, pas besoin de body
                {
                    headers: { 
                      "Content-Type": "application/json", 
                      Authorization: `Bearer ${accessToken}`
                    }  
                }
            );
    
            logout(); // Mettre à jour le contexte d'authentification
            navigate("/", { replace: true });
            window.location.reload(); // Éviter la mise en cache
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

  return (
    <div>
      {/* Avatar clickable */}
      <IconButton onClick={handleClick} sx={{ p: 0 }}>
        <Avatar
          alt="Profile"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
          sx={{
            width: 40,
            height: 40,
            border: "2px solid",
            borderColor: "primary.light",
            "&:hover": { borderColor: "primary.main" },
            cursor: "pointer",
          }}
        />
      </IconButton>

      {/* Menu déroulant */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleClose} component={Link} to="/view-user-profil">
          <Person fontSize="small" sx={{ mr: 1 }} />
          Profil
        </MenuItem>
        <MenuItem onClick={handleClose} component={Link} to="#">
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Paramètres
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          Déconnexion
        </MenuItem>
      </Menu>
    </div>
  );
}
