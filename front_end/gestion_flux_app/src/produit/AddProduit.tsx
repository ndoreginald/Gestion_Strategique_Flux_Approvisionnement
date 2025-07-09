import { 
  Box, 
  Button, 
  Container, 
  createTheme, 
  CssBaseline, 
  Grid, 
  MenuItem, 
  Paper, 
  TextField, 
  ThemeProvider, 
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Fade
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Package as PackageIcon, Tag as TagIcon, FileText as DescriptionIcon, DollarSign as PriceIcon, Image as ImageIcon, Barcode as BarcodeIcon, Calendar as DateIcon, ToggleLeft as StatusIcon, Save as SaveIcon, X as CancelIcon, Battery as CategoryIcon } from 'lucide-react';

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

function AddProduit() {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    prix_vente: '',
    prix_achat: '',
    image: '',
    code_barre: uuidv4(),
    date_creation: new Date().toISOString().split('T')[0],
    statut: 'actif',
    categorie_id: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
           if (!accessToken) {
                console.error("Token manquant. Veuillez vous reconnecter.");
                return;
              }
    fetch(`http://localhost:4001/gestionFluxDB/categorie/`,
        {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
      .then(response => response.json())
      .then(data => {
        if (data) {
          setCategories(data);
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des données :', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      code_barre: formData.code_barre,
      prix_vente: parseFloat(formData.prix_vente),
      prix_achat: parseFloat(formData.prix_achat),
      date_creation: new Date(formData.date_creation).toISOString(),
      categorie_id: formData.categorie_id,
    };
    try {
      const accessToken = sessionStorage.getItem("accessToken");
          if (!accessToken) {
            console.log("❌ Token manquant. Redirection...");
            navigate('/');
            return;
          }
      await axios.post('http://localhost:4001/gestionFluxDB/produit/', data,
         {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/produit/list-produit', { replace: true });
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit :', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Fade in={showSuccess}>
              <Alert 
                severity="success" 
                sx={{ 
                  position: 'fixed', 
                  top: 24, 
                  right: 24, 
                  zIndex: 9999,
                  boxShadow: theme.shadows[3],
                }}
              >
                Produit ajouté avec succès!
              </Alert>
            </Fade>

            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <PackageIcon 
                    size={32}
                    style={{ 
                      color: theme.palette.primary.main,
                      marginRight: theme.spacing(2)
                    }} 
                  />
                  <Typography variant="h4" color="primary.main">
                    Nouveau Produit
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="label"
                        value={formData.label}
                        onChange={handleChange}
                        label="Label du produit"
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <TagIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="Catégorie"
                        name="categorie_id"
                        value={formData.categorie_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <CategoryIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      >
                        {categories.map(cat => (
                          <MenuItem key={cat._id} value={cat._id}>{cat.nom}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        label="Description"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        InputProps={{
                          startAdornment: (
                            <DescriptionIcon size={20} style={{ marginRight: 8, marginTop: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        type="number"
                        name="prix_achat"
                        value={formData.prix_achat}
                        onChange={handleChange}
                        label="Prix d'achat"
                        fullWidth
                        required
                        inputProps={{ min: 1 }}
                        InputProps={{
                          startAdornment: (
                            <PriceIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        type="number"
                        name="prix_vente"
                        value={formData.prix_vente}
                        onChange={handleChange}
                        label="Prix de vente"
                        fullWidth
                        required
                        inputProps={{ min: 1 }}
                        InputProps={{
                          startAdornment: (
                            <PriceIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        label="URL de l'image"
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <ImageIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        name="code_barre"
                        value={formData.code_barre}
                        label="Code barre"
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <BarcodeIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        label="Statut"
                        select
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <StatusIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                      >
                        <MenuItem value="actif">Actif</MenuItem>
                        <MenuItem value="inactif">Inactif</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        type="date"
                        name="date_creation"
                        value={formData.date_creation}
                        label="Date de création"
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <DateIcon size={20} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                          ),
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => navigate('/produit/list-produit')}
                          startIcon={<CancelIcon size={20} />}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="success"
                          startIcon={<SaveIcon size={20} />}
                        >
                          Enregistrer
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AddProduit;