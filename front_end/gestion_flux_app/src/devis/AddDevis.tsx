import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  Autocomplete,
  createTheme,
  Alert,
  Snackbar,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Receipt,
  User,
  Building2,
  CalendarDays,
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  Calculator,
  Percent,
  ShieldAlert,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';

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
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
    },
    success: {
      main: "#059669",
      light: "#10b981",
      dark: "#047857",
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
          padding: '8px 16px',
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

// Données simulées
const users = [
  { _id: '1', name: 'John Doe', email: 'john@example.com' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

const clients = [
  { _id: '1', name: 'Entreprise ABC', email: 'contact@abc.com' },
  { _id: '2', name: 'Société XYZ', email: 'info@xyz.com' },
];

const products = [
  { _id: '1', name: 'Produit A', price: 100, description: 'Description du produit A' },
  { _id: '2', name: 'Produit B', price: 200, description: 'Description du produit B' },
];

interface ProductItem {
  produit_id: string | null;
  quantite: number;
  prix_unitaire: number;
  total: number;
  id: string; // Pour la gestion interne
}

interface DevisData {
  user_id: string | null;
  client_id: string | null;
  date_devis: dayjs.Dayjs;
  validite: dayjs.Dayjs;
  num_devis: string;
  etat: string;
  produits: ProductItem[];
  remise: number;
  taxes: number;
  total_ht: number;
  total_ttc: number;
  reference: string;
}

function AddDevis() {
  const [devisData, setDevisData] = useState<DevisData>({
    user_id: null,
    client_id: null,
    date_devis: dayjs(),
    validite: dayjs().add(30, 'day'),
    num_devis: Math.floor(1000 + Math.random() * 9000).toString(),
    etat: "en cours",
    produits: [],
    remise: 0,
    taxes: 20,
    total_ht: 0,
    total_ttc: 0,
    reference: generateReference(),
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  function generateReference() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `DEV-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: uuidv4(),
      produit_id: null,
      quantite: 1,
      prix_unitaire: 0,
      total: 0,
    };
    setDevisData({
      ...devisData,
      produits: [...devisData.produits, newProduct],
    });
  };

  const removeProduct = (id: string) => {
    setDevisData({
      ...devisData,
      produits: devisData.produits.filter(item => item.id !== id),
    });
    updateTotals();
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: any) => {
    const updatedProducts = devisData.produits.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantite' || field === 'prix_unitaire') {
          updatedItem.total = updatedItem.quantite * updatedItem.prix_unitaire;
        }
        
        if (field === 'produit_id') {
          const product = products.find(p => p._id === value);
          if (product) {
            updatedItem.prix_unitaire = product.price;
            updatedItem.total = product.price * updatedItem.quantite;
          }
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setDevisData({ ...devisData, produits: updatedProducts });
    updateTotals();
  };

  const updateTotals = () => {
    const total_ht = devisData.produits.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (total_ht * devisData.remise) / 100;
    const taxAmount = (total_ht - discountAmount) * (devisData.taxes / 100);
    const total_ttc = total_ht - discountAmount + taxAmount;

    setDevisData(prev => ({
      ...prev,
      total_ht,
      total_ttc,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Formater les données pour l'envoi (enlever le champ id interne)
      const dataToSend = {
        ...devisData,
        date_devis: devisData.date_devis.toDate(),
        validite: devisData.validite.toDate(),
        produits: devisData.produits.map(({ id, ...rest }) => rest),
      };

      console.log('Data to send:', dataToSend);
      
      setSnackbar({
        open: true,
        message: 'Devis créé avec succès!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la création du devis',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    updateTotals();
  }, [devisData.remise, devisData.taxes]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Header />
          <Container maxWidth="xl" sx={{ p: 3, mb: 4, mt: 5 }}>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Receipt size={32} className="text-primary mr-2" />
                        <Typography variant="h4" color="primary">
                          Nouveau devis
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Informations de base */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="N° Devis"
                        value={devisData.num_devis}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FileText size={20} />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Référence"
                        value={devisData.reference}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FileText size={20} />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>État</InputLabel>
                        <Select
                          value={devisData.etat}
                          onChange={(e) => setDevisData({...devisData, etat: e.target.value})}
                          startAdornment={
                            <InputAdornment position="start">
                              <ShieldAlert size={20} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="en cours">En cours</MenuItem>
                          <MenuItem value="accepté">Accepté</MenuItem>
                          <MenuItem value="rejeté">Rejeté</MenuItem>
                          <MenuItem value="expiré">Expiré</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, value) => setDevisData({
                          ...devisData,
                          user_id: value?._id || null,
                        })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Utilisateur"
                            required
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <User size={20} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, value) => setDevisData({
                          ...devisData,
                          client_id: value?._id || null,
                        })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Client"
                            required
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Building2 size={20} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date du devis"
                          value={devisData.date_devis}
                          onChange={(newValue) => setDevisData({
                            ...devisData,
                            date_devis: newValue || dayjs(),
                          })}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarDays size={20} />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date de validité"
                          value={devisData.validite}
                          onChange={(newValue) => setDevisData({
                            ...devisData,
                            validite: newValue || dayjs(),
                          })}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarDays size={20} />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    {/* Section Produits */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom>
                        Produits
                      </Typography>

                      {devisData.produits.map((produit) => (
                        <Paper key={produit.id} sx={{ p: 2, mb: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={5}>
                              <Autocomplete
                                options={products}
                                getOptionLabel={(option) => option.name}
                                onChange={(_, value) => updateProduct(produit.id, 'produit_id', value?._id)}
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    label="Produit" 
                                    required
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Quantité"
                                value={produit.quantite}
                                onChange={(e) => updateProduct(produit.id, 'quantite', Number(e.target.value))}
                                inputProps={{ min: 1 }}
                              />
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Prix unitaire"
                                value={produit.prix_unitaire}
                                onChange={(e) => updateProduct(produit.id, 'prix_unitaire', Number(e.target.value))}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                }}
                              />
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <TextField
                                fullWidth
                                label="Total"
                                value={produit.total.toFixed(2)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                  readOnly: true,
                                }}
                              />
                            </Grid>
                            <Grid item xs={6} md={1}>
                              <Tooltip title="Supprimer">
                                <IconButton color="error" onClick={() => removeProduct(produit.id)}>
                                  <Trash2 size={20} />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}

                      <Button
                        variant="outlined"
                        startIcon={<Plus size={20} />}
                        onClick={addProduct}
                        sx={{ mt: 2 }}
                      >
                        Ajouter un produit
                      </Button>
                    </Grid>

                    {/* Section Totaux */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Grid container spacing={2} justifyContent="flex-end">
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography>Total HT:</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography align="right">
                                  {devisData.total_ht.toFixed(2)} €
                                </Typography>
                              </Grid>

                              <Grid item xs={6}>
                                <Typography>Remise:</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={devisData.remise}
                                  onChange={(e) => setDevisData({
                                    ...devisData,
                                    remise: Number(e.target.value),
                                  })}
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Percent size={20} />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <Typography>TVA ({devisData.taxes}%):</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography align="right">
                                  {((devisData.total_ht * (1 - devisData.remise / 100) * devisData.taxes / 100).toFixed(2))} €
                                </Typography>
                              </Grid>

                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                              </Grid>

                              <Grid item xs={6}>
                                <Typography variant="h6">Total TTC:</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h6" align="right">
                                  {devisData.total_ttc.toFixed(2)} €
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<X size={20} />}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<Save size={20} />}
                        >
                          Enregistrer devis
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </form>
          </Container>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default AddDevis;