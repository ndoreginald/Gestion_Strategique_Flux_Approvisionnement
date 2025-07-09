import { 
  Box, 
  Button, 
  Container, 
  createTheme, 
  CssBaseline, 
  Grid, 
  Paper, 
  TextField, 
  ThemeProvider, 
  Typography,
  IconButton,
  Divider,
  Alert,
  Fade,
  InputAdornment
} from '@mui/material';
import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  Package as PackageIcon,
  Tag as TagIcon, 
  FileText as DescriptionIcon, 
  DollarSign as PriceIcon, 
  Image as ImageIcon, 
  Barcode as BarcodeIcon, 
  Calendar as DateIcon,
  Trash2 as DeleteIcon,
  Plus as AddIcon,
  Save as SaveIcon,
  X as CancelIcon,
  LayoutGrid as CategoryIcon
} from 'lucide-react';

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

function AddCategorie() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    image: '',
    produits: [{
      label: '',
      description: '',
      prix_achat: '',
      prix_vente: '',
      image: '',
      code_barre: uuidv4(),
      date_creation: new Date().toISOString().split('T')[0],
    }],
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.description.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
  
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Vous devez être connecté pour ajouter une catégorie.");
        navigate("/");
        return;
      }
  
      await axios.post(
        `http://localhost:4001/gestionFluxDB/categorie/`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/categorie/list-categorie", { replace: true });
      }, 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Server responded with:", error.response.data);
          alert(`Erreur: ${error.response.data.message}`);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      if (index !== undefined) {
        const updatedProduits = [...prevState.produits];
        updatedProduits[index] = { ...updatedProduits[index], [name]: value };
        return { ...prevState, produits: updatedProduits };
      }
      return { ...prevState, [name]: value };
    });
  };

  const handleAddProduct = () => {
    setFormData(prevState => ({
      ...prevState,
      produits: [...prevState.produits, {
        label: '',
        description: '',
        prix_achat: '',
        prix_vente: '',
        image: '',
        code_barre: uuidv4(),
        date_creation: new Date().toISOString().split('T')[0],
      }],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prevState => ({
      ...prevState,
      produits: prevState.produits.filter((_, i) => i !== index),
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
                Catégorie créée avec succès!
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
                  <CategoryIcon 
                    size={32}
                    style={{ 
                      color: theme.palette.primary.main,
                      marginRight: theme.spacing(2)
                    }} 
                  />
                  <Typography variant="h4" color="primary.main">
                    Nouvelle Catégorie
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        label="Nom de la catégorie"
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TagIcon size={20} />
                            </InputAdornment>
                          ),
                        }}
                      />
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
                            <InputAdornment position="start">
                              <DescriptionIcon size={20} />
                            </InputAdornment>
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
                            <InputAdornment position="start">
                              <ImageIcon size={20} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PackageIcon size={24} />
                          Produits
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddProduct}
                          startIcon={<AddIcon size={20} />}
                        >
                          Ajouter un produit
                        </Button>
                      </Box>

                      {formData.produits.map((produit, index) => (
                        <Paper 
                          key={index}
                          elevation={0}
                          sx={{ 
                            p: 3, 
                            mb: 3, 
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            position: 'relative'
                          }}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                name="label"
                                value={produit.label}
                                onChange={(e) => handleChange(e, index)}
                                label="Label du produit"
                                fullWidth
                                required
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TagIcon size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                name="code_barre"
                                value={produit.code_barre}
                                label="Code barre"
                                fullWidth
                                InputProps={{
                                  readOnly: true,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <BarcodeIcon size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                name="description"
                                value={produit.description}
                                onChange={(e) => handleChange(e, index)}
                                label="Description"
                                fullWidth
                                required
                                multiline
                                rows={4}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <DescriptionIcon size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                type="number"
                                name="prix_achat"
                                value={produit.prix_achat}
                                onChange={(e) => handleChange(e, index)}
                                label="Prix d'achat"
                                fullWidth
                                required
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PriceIcon size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                type="number"
                                name="prix_vente"
                                value={produit.prix_vente}
                                onChange={(e) => handleChange(e, index)}
                                label="Prix de vente"
                                fullWidth
                                required
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PriceIcon size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                name="image"
                                value={produit.image}
                                onChange={(e) => handleChange(e, index)}
                                label="URL de l'image"
                                fullWidth
                                required
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <ImageIcon size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>

                          <IconButton
                            onClick={() => handleRemoveProduct(index)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              color: 'error.main',
                            }}
                          >
                            <DeleteIcon size={20} />
                          </IconButton>
                        </Paper>
                      ))}

                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => navigate('/categorie/list-categorie')}
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

export default AddCategorie;