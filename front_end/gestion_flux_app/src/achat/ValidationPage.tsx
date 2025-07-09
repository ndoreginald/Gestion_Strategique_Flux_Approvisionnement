import { 
    Box, 
    createTheme, 
    CssBaseline, 
    Paper, 
    ThemeProvider, 
    Typography,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Divider,
    CircularProgress,
    TextField
  } from '@mui/material';
  import React, { useEffect, useState } from 'react';
  import Sidebar from '../layout/Sidebar';
  import Header from '../layout/Header';
  import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
  import { Check, Truck, Calendar, Euro } from 'lucide-react';
  import dayjs from 'dayjs';
  import 'dayjs/locale/fr';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
  
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
  
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'Commandé':
        return 'info';
      case 'En cours de livraison':
        return 'warning';
      case 'confirmé':
        return 'success';
      case 'Reçue':
        return 'success';
      case 'retard':
        return 'error';
      case 'annuler':
        return 'error';
      default:
        return 'default';
    }
  }

  function getDelaisColor(delais: string) {
    switch (delais) {
      case 'En cours':
        return 'info';
      case 'Respecté':
        return 'success';
      case 'Retard':
        return 'error';
      default:
        return 'default';
    }
  }

  function normalizeAchatData (achatData) {
    return {
      ...achatData,
      achatId: achatData.achat_id,
      delai_jours: achatData.delai_jours,
      delais: achatData.delais,
      num_achat:achatData.num_achat,
      total_ht:achatData.total_ht,
      total_ttc:achatData.total_ttc,
      fournisseur_id: achatData.fournisseur_id? 
      typeof achatData.fournisseur_id === 'string'
      ? { _id: achatData.fournisseur_id, nom: 'Fournisseur' }
      : { 
          _id: achatData.fournisseur_id._id || '', 
          nom: achatData.fournisseur_id.nom || 'Fournisseur',
          telephone: achatData.fournisseur_id.telephone || ''
        }
    : { _id: '', nom: 'Fournisseur non spécifié', telephone: '' },
      user_id: achatData.user_id,
      date_reception: dayjs(achatData.date_reception || new Date()),
      produits: (achatData.produits || []).map(p => ({
        ...p,
        produit_id: p.produit_id,
        categorie_id: p.produit_id.categorie_id,
        quantite_commandee: p.quantite_commandee ,
        quantite_reçu: p.quantite_reçu ,
        ecart: p.ecart ,
        prix_unitaire: p.prix_unitaire ,
        total: p.total ,
      }))
    };
  };
  
  function ValidationPage() {
    const navigate = useNavigate();
    const { achatId } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const isValidId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    const [error, setError] = useState(null);
    //const [achat, setAchat] = useState(location.state?.achat || null);
    const [achat, setAchat] = useState(() => {
      if (location.state?.achat) {
        return normalizeAchatData(location.state.achat);
      }
      return null;
    });
    const [generatedCode, setGeneratedCode] = useState('');

// Fonction de normalisation des données


// Chargement des données si non fournies via location.state
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      
      if (location.state?.achat) {
        const normalizedData = normalizeAchatData(location.state.achat);
        if (!normalizedData) {
          throw new Error("Données de réception invalides");
        }
        setAchat(normalizedData);
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:4001/gestionFluxDB/achat/${achatId}`);
      const normalizedData = normalizeAchatData(response.data);
      
      if (!normalizedData) {
        throw new Error("Données d'achat invalides");
      }
      
      setAchat(normalizedData);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setError(err.message);
      navigate('/achats/list-achats', { state: { error: "Impossible de charger la réception" } });
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [achatId, location.state, navigate]);

// Gestion des changements de date
const handleDateChange = (newValue: any) => {
  setAchat((prev: any) => ({
    ...prev,
    date_reception: newValue
  }));
};

// Gestion des changements de commentaires
const handleCommentChange = (e) => {
  setAchat((prev: any) => ({
    ...prev,
    commentaires: e.target.value
  }));
};

const handleConfirmReception = async () => {
  try {
    // Vérification complète des données avant envoi
    if (!achat || !achat.fournisseur_id || !achat.produits || achat.produits.length === 0) {
      console.error("Données incomplètes:", {
        achat: !!achat,
        fournisseur: !!achat?.fournisseur_id,
        produits: achat?.produits?.length
      });
      alert("Données de réception incomplètes. Vérifiez les informations du fournisseur et des produits.");
      return;
    }

    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("Token manquant");
      alert("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    // Préparation des données avec vérification approfondie
    const receptionPayload = {
      achat_id: achatId,
      delai_jours: achat.delai_jours,
      delais: achat.delais,
      date_reception: achat.date_reception.toISOString(),
      fournisseur_id: achat.fournisseur_id._id || achat.fournisseur_id,
      produits: achat.produits.map(p => {
        if (!p.produit_id) {
          throw new Error(`Produit ID manquant pour le produit: ${JSON.stringify(p)}`);
        }
        return {
          produit_id: p.produit_id._id ,
          quantite_commandee: p.quantite_commandee || 0,
          quantite_reçu: p.quantite_reçu ,
          prix_unitaire: p.prix_unitaire ,
          ecart: p.ecart ,
          total: p.total ,
          categorie_id: p.categorie_id,
          //produitId: p.produit_id._id,
        };
      }),
      commentaires: achat.commentaires || '',
      statut: "Reçue",
      total_ht: achat.total_ht,
      total_ttc: achat.total_ttc,
      remise: achat.remise,
      taxes: achat.taxes,
    };

    console.log("Données envoyées au serveur:", receptionPayload);

    // 1. Enregistrement de la réception
    const receptionResponse = await axios.post(
      'http://localhost:4001/gestionFluxDB/reception',
      receptionPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 2. Mise à jour du statut de l'achat
    await axios.put(
      `http://localhost:4001/gestionFluxDB/achat/${achatId}`,
      { statut: "Reçue" },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );


    alert("Réception enregistrée avec succès !");
    navigate('/validation/list-validations');
  } catch (error) {
    console.error("Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    alert(`Erreur lors de la validation: ${error.response?.data?.message || error.message}`);
  }
}
   

    if (!achat || loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Header />
            <Box sx={{ p: 3, mt: 8 }}>
              <Grid container spacing={3}>
                {/* En-tête de la commande */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                {/* En-tête */}
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 3,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2
                }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ShoppingCartCheckoutIcon sx={{ 
                      color: "primary.main", 
                      fontSize: 28, 
                      mr: 2 
                    }} />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Validation de la commande #{achat.num_achat}
                    </Typography>
                  </Box>
                  
                  
                </Box>

                {/* Grille d'informations principales */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Colonne 1 - Informations commande */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      backgroundColor: 'background.paper', 
                      p: 2, 
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Informations commande
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Date commande
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {dayjs(achat.date_achat).format('DD/MM/YYYY')}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Validé par
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {achat.user_id.nom}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Délai
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={achat.delais}
                              color={getDelaisColor(achat.delais) as any}
                              size="small"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Statut
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={achat.statut}
                              color={getStatusColor(achat.statut) as any}
                              size="medium"
                              sx={{ 
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Colonne 2 - Fournisseur */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      backgroundColor: 'background.paper', 
                      p: 2, 
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Fournisseur
                      </Typography>
                      
                      <Typography variant="body1" fontWeight="medium">
                        {achat.fournisseur_id.nom}
                      </Typography>
                      
                      {achat.fournisseur_id.contact && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Contact: {achat.fournisseur_id.telephone}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Colonne 3 - Réception */}
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          backgroundColor: 'background.paper', 
                          p: 2, 
                          borderRadius: 2,
                          height: '100%'
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Informations réception
                          </Typography>
                          
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Date de réception"
                              value={achat.date_reception}
                              onChange={(newValue) => setAchat({...achat, date_reception: newValue})}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: 'outlined',
                                  size: 'small'
                                }
                              }}
                              sx={{ mb: 2 }}
                            />
                          </LocalizationProvider>
                          
                          <TextField
                            label="Commentaires"
                            value={achat.commentaires}
                            onChange={(e) => setAchat({...achat, commentaires: e.target.value})}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
  
                {/* Tableau des produits */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Détails des produits
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Produit</TableCell>
                            <TableCell align="right">Quantité commandée</TableCell>
                            <TableCell align="right">Quantité reçue</TableCell>
                            <TableCell align="right">Qté (C/R)</TableCell>
                            <TableCell align="right">Écart</TableCell>
                            <TableCell align="right">Prix unitaire</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {achat.produits.map((produit, index) => (
                            <TableRow key={index}>
                              <TableCell>{produit.produit_id.label}</TableCell>
                              <TableCell align="right">{produit.quantite_commandee}</TableCell>
                              <TableCell align="right">{produit.quantite_reçu}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${produit.quantite_reçu}/${produit.quantite_commandee}`}
                                  color={produit.quantite_reçu === produit.quantite_commandee ? "success" : "warning"}
                                  size="small"
                                />
                              </TableCell>

                              <TableCell align="right" sx={{ 
                                color: produit.ecart < 0 ? 'error.main' : produit.ecart > 0 ? 'success.main' : 'inherit'
                              }}>
                                {produit.ecart}
                              </TableCell>
                              <TableCell align="right">{produit.prix_unitaire.toFixed(2)} €</TableCell>
                              <TableCell align="right">{produit.total.toFixed(2)} €</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
  
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Grid container spacing={2} sx={{ maxWidth: 400 }}>
                        <Grid item xs={6}>
                          <Typography variant="body1">Remise:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">{achat.remise.toFixed(2) || '0.00'} €</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">Total HT:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">{achat.total_ht.toFixed(2) || '0.00'} €</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">Taxes ({achat.taxes}%):</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">
                            {(achat.total_ht * (achat.taxes / 100)).toFixed(2) || '0.00'} €
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">Total TTC:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold" align="right">
                            {achat.total_ttc.toFixed(2) || '0.00'} €
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
  
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => navigate(`/achats/list-achats`)}
                      >
                        Refuser la livraison
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Check />}
                        onClick={handleConfirmReception}
                      >
                        Valider la réception
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
  
  export default ValidationPage;