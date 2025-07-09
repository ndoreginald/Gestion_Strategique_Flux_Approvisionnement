import { Box, Button, CircularProgress, createTheme, CssBaseline, Divider, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

function ReceptionPage() {

  const [achat, setAchat] = useState({
    _id: '',
    fournisseur_id: { _id: '', nom: '' , telephone: '' },
    user_id: { _id: '', nom: '' },
    date_achat: '',
    date_reception: dayjs(),
    commentaires: '',
    date_prevu: '',
    num_achat: 0,
    statut: 'Commandé',
    delais: 'En cours',
    delai_jours: 0,
    produits: [],
    remise: 0,
    taxes: 0,
    total_ht: 0,
    total_ttc: 0,
  });

  const calculateTotals = useCallback(() => {
    const totalHT = achat.produits.reduce((sum, produit) => {
      return sum + (parseInt(produit.quantite_reçu) * parseFloat(produit.prix_unitaire || 0));
    }, 0);
    const totalHTAfterDiscount = totalHT - (achat.remise || 0);
    const totalTTC = totalHTAfterDiscount + (totalHTAfterDiscount * ((achat.taxes || 0) / 100));

    setAchat(prev => ({
      ...prev,
      total_ht: totalHTAfterDiscount,
      total_ttc: totalTTC,
    }));
  }, [achat.produits, achat.remise, achat.taxes]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { achatId } = useParams();

  useEffect(() => {
    const fetchAchat = async () => {
      try {
        if (!achatId || achatId === 'undefined' || achatId === 'null') {
          throw new Error("ID d'achat manquant ou invalide");
        }

        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Session expirée, veuillez vous reconnecter");
        }

        const response = await axios.get(`http://localhost:4001/gestionFluxDB/achat/${achatId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.data) {
          throw new Error("Achat non trouvé");
        }

        setAchat({
          ...response.data,
          achat_id: response.data._id,
          produits: response.data.produits.map(p => ({
            ...p,
            produit_id: p.produit_id ,
            quantite_commandee: p.quantite,
            quantite_reçu: p.quantite_reçu || 0,
            ecart: (p.quantite_reçu || 0) - p.quantite,
            prix_unitaire: p.prix_unitaire,
            total: (p.quantite_reçu || 0) * p.prix_unitaire,
            categorie_id: p.categorie_id || p.produit_id.categorie_id
          })),
          remise: response.data.remise,
          taxes: response.data.taxes,
          total_ht: response.data.total_ht,
          total_ttc: response.data.total_ttc,
          deliveryAddress: response.data.deliveryAddress
        });
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
        if (err.message.includes("ID d'achat")) {
          navigate('/achats/list-achats');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchat();
  }, [achatId, navigate]);

 const handleQuantiteRecuChange = (index, value) => {
      const newProduits = [...achat.produits];
      const quantite = parseInt(value) || 0;
      const quantiteMax = newProduits[index].quantite_commandee;
      
      newProduits[index].quantite_reçu = Math.min(quantite, quantiteMax);
      newProduits[index].ecart = newProduits[index].quantite_reçu - newProduits[index].quantite_commandee;
      newProduits[index].total = newProduits[index].quantite_reçu * (newProduits[index].prix_unitaire || 0);
      
      // Calculate new totals
      const totalHT = newProduits.reduce((sum, p) => sum + (p.total || 0), 0);
      const totalTTC = totalHT * (1 + (achat.taxes || 0) / 100);
      
      setAchat({ 
        ...achat, 
        produits: newProduits,
        total_ht: totalHT,
        total_ttc: totalTTC
      });
      
    };

  const handleSubmit = () => {
    const allProductsReceived = achat.produits.every(p => p.quantite_reçu > 0);
  
    if (!allProductsReceived) {
      alert("Veuillez saisir une quantité reçue pour tous les produits avant validation.");
      return;
    }

    // Calculer le délai en jours
    const delaiJours = dayjs(achat.date_reception).diff(achat.date_achat, 'days');

    // Préparer les données à envoyer à ValidationPage
    const Data = {
      achat_id: achat._id,
      num_achat:achat.num_achat,
      date_reception: achat.date_reception,
      fournisseur_id: achat.fournisseur_id,
      user_id: achat.user_id,
      delais: achat.delais,
      statut: achat.statut,
      delai_jours:delaiJours,
      produits: achat.produits.map(p => ({
        produit_id: p.produit_id,
        quantite_commandee: p.quantite_commandee,
        quantite_reçu: p.quantite_reçu,
        ecart: p.ecart,
        prix_unitaire: p.prix_unitaire,
        total:p.total
      })),
      commentaires: achat.commentaires,
      remise: achat.remise,
      taxes: achat.taxes,
      total_ht: achat.total_ht,
      total_ttc: achat.total_ttc
    };
    console.error("données envoyées :", Data);
    // Naviguer vers ValidationPage avec les données
    navigate(`/validation/${achatId}`, {
      state: {
        achat:Data
      }
    });
  };

  if (loading) {
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
          <Paper sx={{ p: 3, mb: 4, border: "1px solid #ddd", boxShadow: 3, mt: 8 }}>
            {/* Titre */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ShoppingCartCheckoutIcon sx={{ color: "primary.main", fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                Réception des produits - Commande #{achat.num_achat}
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          {/* Ligne 1 - Informations principales */}
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Fournisseur</Typography>
              <Typography variant="body1">{achat.fournisseur_id?.nom || '-'}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} md={2}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Validé par</Typography>
              <Typography variant="body1">{achat.user_id?.nom || '-'}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={3} />

          <Grid item xs={6} md={2}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Date achat</Typography>
              <Typography variant="body1">{dayjs(achat.date_achat).format('DD/MM/YYYY')}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} md={2}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Date réception</Typography>
              <Typography variant="body1">{dayjs(achat.date_reception).format('DD/MM/YYYY')}</Typography>
            </Paper>
          </Grid>


          {/* Ligne 2 - Contrôles */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Commentaires"
              value={achat.commentaires}
              onChange={(e) => setAchat({...achat, commentaires: e.target.value})}
              fullWidth
              multiline
              rows={2}
              size="small"
            />
          </Grid>

          <Grid item xs={2} />

          <Grid item xs={6} md={2}>
            <TextField
              select
              label="Statut"
              value={achat.statut}
              onChange={(e) => setAchat({ ...achat, statut: e.target.value })}
              fullWidth
              size="small"
            >
              {["Encours_de_livraison", "annuler", "Reçue"].map((statut) => (
                <MenuItem key={statut} value={statut}>
                  {statut}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              select
              label="Délai"
              value={achat.delais}
              onChange={(e) => setAchat({ ...achat, delais: e.target.value })}
              fullWidth
              size="small"
            >
              {["Respecté", "Retard"].map((delais) => (
                <MenuItem key={delais} value={delais}>
                  {delais}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>Quantité Attendue</TableCell>
                    <TableCell>Quantité Reçue</TableCell>
                    <TableCell>Écart</TableCell>
                    <TableCell>Prix Unitaire</TableCell>
                    <TableCell>Total</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {achat.produits.map((produit, index) => (
                    <TableRow key={produit.produit_id._id || index}>
                      <TableCell>{produit.produit_id?.label || 'Produit inconnu'}</TableCell>
                      <TableCell>{produit.quantite_commandee}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={produit.quantite_reçu}
                          onChange={(e) => handleQuantiteRecuChange(index, e.target.value)}
                          inputProps={{ 
                            min: 0, 
                            max: produit.quantite_commandee,
                            step: 1
                          }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell sx={{ color: produit.ecart < 0 ? 'error.main' : 'success.main' }}>
                        {produit.ecart}
                      </TableCell>
                      <TableCell>{produit.prix_unitaire.toFixed(2)} €</TableCell>
                      <TableCell>{(produit.quantite_reçu * produit.prix_unitaire).toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />
  
                    {/* Résumé des totaux */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Grid container spacing={2} sx={{ maxWidth: 400 }}>
                <Grid item xs={6}>
                  <Typography variant="body1">Remise:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">{achat.remise.toFixed(2)} €</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Total HT:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">{achat.total_ht.toFixed(2)} €</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Taxes ({achat.taxes}%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">{(achat.total_ht * (achat.taxes / 100)).toFixed(2)} €</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="bold">Total TTC:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="bold" align="right">{achat.total_ttc.toFixed(2)} €</Typography>
                </Grid>
              </Grid>
            </Box>


            <Grid container spacing={2} justifyContent="right" sx={{ mt: 3 }}>
            <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: '#d32f2f',
                    '&:hover': {
                      backgroundColor: '#b71c1c',
                    },
                  }}
                  onClick={() => navigate('/achats/list-achats')}
                >
                  Annuler
                </Button>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  onClick={handleSubmit}
                  disabled={loading ||!achat.produits.length}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Enregistrement...' : 'Valider'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ReceptionPage;