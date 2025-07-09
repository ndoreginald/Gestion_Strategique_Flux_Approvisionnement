import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import { 
  Dashboard as DashboardIcon,
  AccountBalance as BudgetIcon,
  Business as SupplierIcon,
  PeopleAlt as DepartmentIcon,
  Assessment as ReportIcon,
  BarChart as ForecastIcon,
  Inventory as InventoryIcon,
  LocalShipping as LogisticsIcon
} from '@mui/icons-material';
import {
  ShoppingCart,
  Users,
  Package,
  BadgeDollarSign,
  Wallet,
  LogOut,
  Settings,
  HelpCircle,
  User,
  UserCheck,
  LayoutDashboard,
  ArrowRightLeft,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {  Category as CategoryIcon, Image as ImageIcon, Description as DescriptionIcon, AttachMoney as AttachMoneyIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';



const menuItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", path: "/dashboard", roles: ['admin', 'user'] },
  { icon: <BudgetIcon />, label: "Budget", path: "/budget/view-budget" , roles: ['admin']},
  { icon: <CategoryIcon />, label: "Catégories", path: "/categorie/list-categorie" , roles: ['admin', 'user']},
  { icon: <ShoppingCart />, label: "Produits", path: "/produit/list-produit" , roles: ['admin', 'user']},
  { icon: <SupplierIcon />, label: "Fournisseurs", path: "/fournisseurs" , roles: ['admin', 'user']},
  { icon: <Users />, label: "Clients", path: "/clients" , roles: ['admin', 'user']},
  { icon: <ShoppingCart />, label: "Achats", path: "/achats/list-achats" , roles: ['admin', 'user']},
  { icon: <BadgeDollarSign />, label: "Ventes", path: "/vente/list-vente" , roles: ['admin', 'user']},
  { icon: <BadgeDollarSign />, label: "Devis", path: "/devis/list-devis" , roles: ['admin', 'user']},
  { icon: <InventoryIcon />, label: "Inventory", path: "#" , roles: ['admin']},
  { icon: <UserCheck />, label: "Utilisateurs", path: "/users" , roles: ['admin']},
  
];

const supportItems = [
  { icon: <Settings />, label: "Paramètres", path: "#" , roles: ['admin', 'user']},
  { icon: <HelpCircle />, label: "Aide", path: "#" , roles: ['admin', 'user']},
];

const stocktItems = [
  { icon: <ArrowRightLeft />, label: "Entrée/Sortie", path: "/stocks/view-stock" , roles: ['admin', 'user']},
  { icon: <LocalAtmIcon />, label: "Finances", path: "/stocks/finances" , roles: ['admin', 'user']},
  { icon: <LogisticsIcon />, label: "Logistics", path: "/devis/stat" , roles: ['admin', 'user']},
];


  
export function Sidebar() {

    const navigate = useNavigate(); 
    const { logout , userRole} = useAuth(); 

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
              {}, 
              {
                  headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${accessToken}`
                  }  
              }
          );
  
          logout(); // Mettre à jour le contexte d'authentification
          navigate("/", { replace: true });
          window.location.reload(); 
      } catch (error) {
          console.error("Erreur lors de la déconnexion :", error);
      }
  };  
  

  return (
    
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: 250, boxSizing: "border-box", p: 2 },
      }}
    >
      {/* Titre du Dashboard */}
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Dashboard SCM
        </Typography>
      </Box>

      <Divider />

      {/* Section Principal */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
          Principal
        </Typography>
      </Box>
      <List>
  {menuItems
    .filter(item => item.roles.includes(userRole || "user"))
    .map((item, index) => (
      <ListItem key={index} disablePadding>
        <ListItemButton onClick={() => navigate(item.path)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    ))
  }
</List>


      <Divider />

      {/* Section Stock */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
          Stocks
        </Typography>
      </Box>
      <List>
        {stocktItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Section Support */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
          Support
        </Typography>
      </Box>
      <List>
        {supportItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Déconnexion */}
      <Box sx={{ mt: 3 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogOut />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
