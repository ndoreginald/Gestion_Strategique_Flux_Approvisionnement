
import { Box, Button, ButtonGroup, createTheme, CssBaseline } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled, ThemeProvider } from '@mui/material/styles';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import {
  ShoppingCart,
  Package,
  BadgeDollarSign,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import DashboardCard from './DashboardCard';
//import DashboardCard from "./DashboardCard";



const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});


function Dashboard() {

  const cards = [
    {
      title: "Commandes en cours",
      value: "24",
      subtitle: "12 en attente de validation",
      icon: ShoppingCart,
      color: "#E3F2FD",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Stock total",
      value: "1,234",
      subtitle: "85% de capacité utilisée",
      icon: Package,
      color: "#E8F5E9",
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Ventes du mois",
      value: "€45,678",
      subtitle: "Objectif: €50,000",
      icon: BadgeDollarSign,
      color: "#E1F5FE",
      trend: { value: 5, isPositive: false },
    },
    {
      title: "Performance logistique",
      value: "94%",
      subtitle: "Taux de livraison à temps",
      icon: TrendingUp,
      color: "#FFF3E0",
      trend: { value: 2, isPositive: true },
    },
    {
      title: "Fournisseurs actifs",
      value: "47",
      subtitle: "8 nouveaux ce mois",
      icon: Users,
      color: "#FFEBEE",
      trend: { value: 15, isPositive: true },
    },
    {
      title: "Délai moyen",
      value: "3.2 jours",
      subtitle: "Traitement des commandes",
      icon: Clock,
      color: "#F3E5F5",
      trend: { value: 10, isPositive: true },
    },
  ];

  return (

    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: 'flex' }}>
        
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '10px' }}>
        <Header />
       <br /><br />
       <div  className='mb-2'></div>
       <Box p={3}>
      {/* Titre */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Tableau de Bord
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Vue d'ensemble de la chaîne logistique
          </Typography>
        </Box>

        {/* Boutons de filtrage */}
        <ButtonGroup variant="outlined">
          <Button>Semaine</Button>
          <Button variant="contained">Mois</Button>
          <Button>Année</Button>
        </ButtonGroup>
      </Box>

      {/* Grid des cartes */}
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DashboardCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
        </main>
      </div>
    </ThemeProvider>
    
      </>
   
  );
}

export default Dashboard;
