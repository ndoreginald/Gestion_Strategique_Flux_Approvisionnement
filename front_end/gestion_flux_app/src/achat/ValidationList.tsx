import { Box, Button, Chip, createTheme, CssBaseline, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useNavigate } from 'react-router-dom';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import dayjs from 'dayjs';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#059669",
      light: "#10b981",
      dark: "#047857",
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

const getDelaisColor = (delais: string) => {
  switch(delais) {
    case 'Retard': return 'error';
    case 'Respecté': return 'success';
    case 'En cours': return 'primary';
    default: return 'default';
  }
};

const getDelaiJourColor = (value: string | number) => {
  if (typeof value === 'number') {
    if (value > 0) return 'error';    
    if (value < 0) return 'success';  
    return 'primary';                 
  }

  return 'default'; 
};

function ValidationList() {
  const [receptions, setReceptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const fetchReceptions = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Token manquant. Veuillez vous reconnecter.");
        return;
      }
  
      try {
        console.log("Début de la requête API..."); // Indique le début de la requête
        
        const response = await axios.get('http://localhost:4001/gestionFluxDB/reception/', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        console.log("Réponse brute de l'API:", response); // Affiche toute la réponse
        console.log("Données reçues:", response.data); // Affiche uniquement les données
  
        if (response.data) {
          const formattedReceptions = response.data.map(reception => ({
            ...reception,
            date_reception: dayjs(reception.date_reception).format('DD/MM/YYYY'),
            produits: reception.produits.map(produit => ({
              ...produit,
              ecartColor: produit.ecart < 0 ? 'error' : produit.ecart > 0 ? 'success' : 'info'
            }))
          }));
          
          console.log("Réceptions formatées:", formattedReceptions); // Affiche les données après formatage
          setReceptions(formattedReceptions);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réceptions :', error);
        console.error("Détails de l'erreur:", error.response?.data); // Affiche les détails de l'erreur si disponible
      }
    };
  
    fetchReceptions();
  }, []);

  const filteredReceptions = receptions.filter(reception => 
    reception.achat_id?.num_achat?.toString().includes(searchTerm) ||
    reception.achat_id?.fournisseur_id?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.produits.some(produit => 
      produit.produit_id?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Header />
          <Paper sx={{ p: 3, mb: 4, border: "1px solid #ddd", boxShadow: 3, mt: 8 }}>
            {/* Titre */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ShoppingCartCheckoutIcon sx={{ color: "primary.main", fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                Historique des Réceptions
              </Typography>
            </Box>

            {/* Barre de recherche */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Rechercher..." 
                  variant="outlined" 
                  size="small"
                  fullWidth
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="table des réceptions">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Commande</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fournisseur</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Réception</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Délai</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Délais jours</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Produit</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantité</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Écart Produit</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Unitaire</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total HT</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Satisfaction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReceptions.map(reception => (
                    reception.produits.map((produit, index) => (
                      <TableRow 
                        key={`${reception._id}-${index}`}
                        sx={{ 
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        {index === 0 && (
                          <>
                            <TableCell rowSpan={reception.produits.length}>
                              {reception.achat_id?.num_achat || 'N/A'}
                            </TableCell>
                            <TableCell rowSpan={reception.produits.length}>
                              {reception.code_reception || 'N/A'}
                            </TableCell>
                            <TableCell rowSpan={reception.produits.length}>
                              {reception.achat_id?.fournisseur_id || 'N/A'}
                            </TableCell>
                            <TableCell rowSpan={reception.produits.length}>
                              {reception.date_reception}
                            </TableCell>
                            <TableCell rowSpan={reception.produits.length}>
                              <Chip 
                                label={reception.delais}
                                color={getDelaisColor(reception.delais)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell rowSpan={reception.produits.length}>
                              <Chip 
                                label={reception.delai_jours}
                                color={getDelaiJourColor(reception.delai_jours)}
                                size="small"
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell>{produit.produit_id?.label || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${produit.quantite_reçu}/${produit.quantite_commandee}`}
                            color={produit.quantite_reçu === produit.quantite_commandee ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={produit.ecart}
                            color={produit.ecart < 0 ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{produit.prix_unitaire?.toFixed(2)} €</TableCell>
                        {index === 0 && (
                          <>
                            <TableCell rowSpan={reception.produits.length}>
                              {reception.total_ht?.toFixed(2)} €
                            </TableCell>
                            <TableCell rowSpan={reception.produits.length}>
                              <Chip 
                                label={reception.satisfaction}
                                color={
                                  reception.satisfaction >= 4 ? 'success' : 
                                  reception.satisfaction >= 2 ? 'warning' : 'error'
                                }
                              />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ValidationList;