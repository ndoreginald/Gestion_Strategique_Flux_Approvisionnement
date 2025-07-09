import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Chip
} from '@mui/material';
import { Add, SaveOutlined, RestartAlt, Edit, Delete, Check, Close } from '@mui/icons-material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Autocomplete } from '@mui/material';
import axios from 'axios';

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

interface Category {
  //_id?: string;
  categorie_id: string;
  nom: string;
  allocatedAmount: number;
}

interface BudgetFormData {
  fiscalYear: number;
  period: 'Mensuel' | 'Trimestriel' | 'Annuel';
  status: 'Brouillon' | 'Validé' | 'Clôturé';
  budgetAmount: number;
  categories: Category[];
}


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const BudgetForm: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editName, setEditName] = useState('');
  const { control, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: {
      fiscalYear: currentYear,
      period: 'Annuel',
      categories: [],
      status: 'Brouillon',
      budgetAmount: 0
    }
  });

const [formData, setFormData] = useState({
        fiscalYear: currentYear,
        period: 'Annuel',
        status: 'Brouillon',
        budgetAmount: 0,
        categories: [{categorie_id: '', nom: ''}]
      });

const [availableCategories, setAvailableCategories] = useState<{ _id: string; nom: string; }[]>([]);

 useEffect(() => {
  const loadCategories = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        navigate('/');
        return;
      }

      const response = await axios.get('http://localhost:4001/gestionFluxDB/categorie/', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('data',response);
      setAvailableCategories(response.data.map((cat: any) => ({
        _id: cat._id,
        nom: cat.nom,
        //allocatedAmount: 0
      })));
      
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  loadCategories();
}, []);


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const confirmation = window.confirm("Êtes-vous sûr de vouloir créer ce budget ?");
  if (!confirmation) {
    // Si l'utilisateur annule, on arrête ici
    return;
  }

  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/');
      return;
    }

    // Préparation des données pour l'API
    const payload = {
      ...formData,
      budgetAmount: formData.budgetAmount,
      categories: formData.categories
        .filter(c => c.nom && c.allocatedAmount > 0)
        .map(c => ({
          categorie_id: c.categorie_id, 
          allocatedAmount: c.allocatedAmount
        }))
    };

    const response = await axios.post(
      'http://localhost:4001/gestionFluxDB/budget/',
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Budget créé:', response.data);
    navigate('/budget/view-budget');

  } catch (error) {
    console.error('Erreur:', error);
    alert("Une erreur est survenue lors de la création du budget");
  }
};

const addCategory = () => {
  setFormData(prev => ({
    ...prev,
    categories: [
      ...prev.categories,
      {
        categorie_id: '',
        nom: '',
        allocatedAmount: 0
      }
    ]
  }));
};

const removeCategory = (index: number) => {
  setFormData(prev => {
    const updatedCategories = [...prev.categories];
    updatedCategories.splice(index, 1);
    
    return {
      ...prev,
      categories: updatedCategories,
      budgetAmount: updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0)
    };
  });
};

const updateCategory = (id: string, field: string, value: any) => {
  setFormData(prev => ({
    ...prev,
    categories: prev.categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ),
    budgetAmount: field === 'allocatedAmount' 
      ? prev.categories.reduce((sum, c) => sum + (c.id === id ? Number(value) : c.allocatedAmount), 0)
      : prev.budgetAmount
  }));
};  

const handleCategorieChange = (index: number, field: string, value: any) => {
  setFormData(prev => {
    const updatedCategories = [...prev.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: field === 'allocatedAmount' ? Number(value) : value
    };
    
    return {
      ...prev,
      categories: updatedCategories,
      budgetAmount: field === 'allocatedAmount' 
        ? updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0)
        : prev.budgetAmount
    };
  });
};

  const steps = ['Informations Générales', 'Répartition du Budget', 'Validation'];

  const handleNext = (e) => {
    if (activeStep === 1) {
      // Calculate total budget amount before proceeding
      const total = categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0);
      setValue('budgetAmount', total);
    }
    e.preventDefault();
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(Number(e.target.value));
  };

const handleDeleteCategory = (id: string) => {
  const filteredCategories = categories.filter(cat => cat.id !== id);
  setCategories(filteredCategories);
  setValue('categories', filteredCategories);
};

  const onSubmit: SubmitHandler<any> = (data) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', data);
      setIsSubmitting(false);
      setFormSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormSuccess(false);
        setActiveStep(0);
        reset({
          fiscalYear: currentYear,
          period: 'Annuel',
          categories: [],
          status: 'Brouillon',
          budgetAmount: 0
        });
      }, 2000);
    }, 1500);
  };

  const handleReset = () => {
    reset({
      fiscalYear: currentYear,
      period: 'Annuel',
      categories: [],
      status: 'Brouillon',
      budgetAmount: 0
    });
    setCategories([]);
    setActiveStep(0);
  };

  // Calculate chart data
  const chartData = formData.categories.filter(c => c.allocatedAmount > 0)
      .map(c => ({
        nom: c.nom,
        value: c.allocatedAmount
      }));

const handleEditSave = (id: string) => {
    const updatedCategories = categories.map(cat => 
      cat._id === id ? { ...cat, allocatedAmount: editValue, nom: editName } : cat
      );
      setCategories(updatedCategories);
      setValue('categories', updatedCategories);
      setEditingId(null);
  };

const handleEditStart = (id: string, amount: number, name: string) => {
  setEditingId(id);
  setEditValue(amount);
  setEditName(name);
};

const handleEditCancel = () => {
  setCategories({ id: null, index: null });
};

  const totalAllocated = formData.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

  return (
     <ThemeProvider theme={theme}>
        <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
               <Sidebar />
                 <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                  <Header />
                <Container maxWidth="xl" sx={{mt:8}}>
                <CardContent>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                    </Stepper>

                    <form onSubmit={handleSubmit}>
                    {activeStep === 0 && (
                        <Box my={4}>
                          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                              Paramètres Généraux du Budget
                            </Typography>

                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Controller
                                  name="fiscalYear"
                                  control={control}
                                  rules={{ required: "L'année fiscale est requise" }}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      label="Année Fiscale"
                                      type="number"
                                      fullWidth
                                      variant="outlined"
                                      error={!!errors.fiscalYear}
                                      helperText={errors.fiscalYear?.message}
                                      InputProps={{ inputProps: { min: 2020, max: 2030 } }}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <Controller
                                  name="period"
                                  control={control}
                                  rules={{ required: "La période est requise" }}
                                  render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.period} variant="outlined">
                                      <InputLabel id="period-label">Période</InputLabel>
                                      <Select
                                        {...field}
                                        labelId="period-label"
                                        label="Période"
                                      >
                                        <MenuItem value="Mensuel">Mensuel</MenuItem>
                                        <MenuItem value="Trimestriel">Trimestriel</MenuItem>
                                        <MenuItem value="Annuel">Annuel</MenuItem>
                                      </Select>
                                    </FormControl>
                                  )}
                                />
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <Controller
                                  name="status"
                                  control={control}
                                  render={({ field }) => (
                                    <FormControl fullWidth variant="outlined">
                                      <InputLabel id="status-label">Statut</InputLabel>
                                      <Select
                                        {...field}
                                        labelId="status-label"
                                        label="Statut"
                                      >
                                        <MenuItem value="Brouillon">Brouillon</MenuItem>
                                        <MenuItem value="Validé">Validé</MenuItem>
                                        <MenuItem value="Clôturé">Clôturé</MenuItem>
                                      </Select>
                                    </FormControl>
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Box my={4}>
                      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            Répartition du Budget
                          </Typography>
                          <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={addCategory}
                            color="secondary"
                            sx={{ borderRadius: 2 }}
                          >
                            Ajouter une catégorie
                          </Button>
                        </Box>

                        <Grid container spacing={4}>
                          {/* Table des catégories */}
                          <Grid item xs={12} md={7}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                      <TableCell><strong>Catégorie</strong></TableCell>
                                      <TableCell align="right"><strong>Montant Alloué (€)</strong></TableCell>
                                      <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {formData.categories.map((category, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <Autocomplete
                                            options={availableCategories.filter(cat => 
                                              !formData.categories.some(c => c.categorie_id === cat._id) || 
                                              cat._id === category.categorie_id
                                            )}
                                            getOptionLabel={(option) => option.nom || ''}
                                            value={availableCategories.find(c => c._id === category.categorie_id) || null}
                                            onChange={(event, newValue) => {
                                              handleCategorieChange(index, 'nom', newValue?.nom || '');
                                              handleCategorieChange(index, 'categorie_id', newValue?._id || '');
                                            }}
                                            renderInput={(params) => (
                                              <TextField 
                                                {...params} 
                                                //label="Catégorie" 
                                                required 
                                                size="small"
                                                error={!category.categorie_id}
                                                helperText={!category.categorie_id ? "Sélectionnez une catégorie" : ""}
                                              />
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell align="right">
                                          <TextField
                                            value={category.allocatedAmount}
                                            onChange={(e) => handleCategorieChange(index, 'allocatedAmount', e.target.value)}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            inputProps={{ min: 0 }}
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <IconButton onClick={() => removeCategory(index)} color="error">
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Paper>
                          </Grid>

                          {/* Graphique */}
                          <Grid item xs={12} md={5}>
                            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom align="center">
                                Répartition Visuelle
                              </Typography>

                              {chartData.length > 0 ? (
                                <>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                      <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ nom, percent }) => `${nom}: ${(percent * 100).toFixed(0)}%`}
                                      >
                                        {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                      </Pie>
                                    </PieChart>
                                  </ResponsiveContainer>

                                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography variant="subtitle1">
                                      Total Alloué : <strong>{totalAllocated.toLocaleString()} €</strong>
                                    </Typography>
                                  </Box>
                                </>
                              ) : (
                                <Box
                                  sx={{
                                    height: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                  }}
                                >
                                  <Typography>Aucune donnée à afficher</Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>

                    )}

                    {activeStep === 2 && (
                        <Box>
                        <Typography variant="h5" gutterBottom fontWeight="600">
                          Validation du Budget
                        </Typography>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      {[
                        { label: "Année Fiscale", value: watch('fiscalYear') },
                        { label: "Période", value: watch('period') },
                        { label: "Statut", value: watch('status') }
                      ].map((item, i) => (
                        <Grid item xs={12} md={4} key={i}>
                          <Typography variant="subtitle2" color="text.secondary">{item.label}</Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {item.label === "Statut" ? (
                              <Chip
                                label={item.value}
                                color={
                                  item.value === 'Validé' ? 'success' :
                                  item.value === 'Brouillon' ? 'primary' :
                                  item.value === 'Clôturé' ? 'warning' : 'default'
                                }
                                size="small"
                              />
                            ) : item.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                Détails des Catégories
                                </Typography>
                                <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                    <TableRow>
                                        <TableCell>Catégorie</TableCell>
                                        <TableCell align="right">Montant</TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {formData.categories.filter(c => c.allocatedAmount > 0).map((category, index) => (
                                        <TableRow key={index}>
                                        <TableCell>{category.nom}</TableCell>
                                        <TableCell align="right">{category.allocatedAmount.toLocaleString()} €</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </TableContainer>
                            </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                Résumé Financier
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Total Budget:</Typography>
                                <Typography fontWeight="bold">{formData.budgetAmount.toLocaleString()} €</Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Nombre de Catégories:</Typography>
                                <Typography fontWeight="bold">{formData.categories.length}</Typography>
                                </Box>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">Statut:</Typography>
                                <Typography 
                                    variant="subtitle1" 
                                    color={
                                    watch('status') === 'Validé' ? 'success.main' : 
                                    watch('status') === 'Clôturé' ? 'error.main' : 'text.primary'
                                    }
                                >
                                    {watch('status')}
                                </Typography>
                                </Box>
                            </Paper>
                            </Grid>
                        </Grid>
                        
                        {formSuccess && (
                            <Alert severity="success" sx={{ mt: 3 }}>
                            Budget créé avec succès!
                            </Alert>
                        )}
                        </Box>
                    )}

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                        onClick={handleReset}
                        variant="outlined" 
                        startIcon={<RestartAlt />}
                        sx={{ mr: 1 }}
                        >
                        Réinitialiser
                        </Button>
                        
                        <Box>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{ mr: 1 }}
                        >
                            Précédent
                        </Button>
                        
                        {activeStep < steps.length - 1 ? (
                            <Button 
                            variant="contained" 
                            onClick={handleNext}
                            color="primary"
                            disabled={activeStep === 1 && formData.categories.length === 0}
                            >
                            Suivant
                            </Button>
                        ) : (
                            <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                            disabled={isSubmitting || formData.categories.length === 0}
                            >
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le budget'}
                            </Button>
                        )}
                        </Box>
                    </Box>
                    </form>
                </CardContent>
                </Container>

            </Box>
          </Box>
        </ThemeProvider>
  );
};

export default BudgetForm;