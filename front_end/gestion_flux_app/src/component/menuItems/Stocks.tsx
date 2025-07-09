import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  Paper,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
  createTheme,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Package,
  PackagePlus,
  PackageMinus,
  Search,
  Plus,
  FileText,
  Calendar,
  Building2,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  RefreshCcw,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import axios from 'axios';
import { MenuItem } from '@mui/material';


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
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type MovementType = 'Entrée' | 'Sortie' | null;

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


function Stocks () {

  const [stocks, setStocks] = useState<any[]>([]);
  //const [typeFilter, setTypeFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState<MovementType>(null);
  const [totals, setTotals] = useState({ total_entree: 0, total_sortie: 0 });
  const [filterType, setFilterType] = useState("mois");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [prod, setProd] = useState<number | null>(null);
  const [stockactu, setStockactu] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'in' | 'out'>('in');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (type: 'in' | 'out') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleMovementSubmit = () => {
    setSnackbar({
      open: true,
      message: `${dialogType === 'in' ? 'Entrée' : 'Sortie'} de stock enregistrée avec succès`,
      severity: 'success',
    });
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'success';
      case 'Stock faible':
        return 'warning';
      case 'Rupture':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMovementColor = (type: string) => {
    if (type === 'Entrée') return 'success';  // vert
    if (type === 'Sortie') return 'error';    // rouge
    return 'info'; // bleu par défaut
  };
  

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("Token manquant. Veuillez vous reconnecter.");
              return;
          }
        axios.get('http://localhost:4001/gestionFluxDB/stock/produits/quantite-actuelle', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      })
      .then(response => {
        if (response.data) {
          setStockactu(response.data);
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des stocks :', error));

      axios.get('http://localhost:4001/gestionFluxDB/stock/', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(response => {
          if (response.data) {
            setStocks(response.data);
          }
        })
        .catch(error => console.error('Erreur lors de la récupération des stocks :', error));

      axios.get('http://localhost:4001/gestionFluxDB/produit/count', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(response => {setProd(response.data.total);})
        .catch(error => console.error('Erreur lors de la récupération du calcul total des produits :', error));

        axios.get('http://localhost:4001/gestionFluxDB/stock/quantites-totales', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then(response => {setTotals(response.data);})
          .catch(error => console.error('Erreur lors de la récupération du calcul total des produits :', error));
  }, []);

  const fetchTotals = async () => {
    let url = "http://localhost:4001/gestionFluxDB/stock/quantites-totales";
  
    if (filterType === "personnalise" && startDate && endDate) {
      const s = new Date(startDate).toISOString();
      const e = new Date(endDate).toISOString();
      url += `?startDate=${s}&endDate=${e}`;
    } else if (filterType === "jour") {
      const today = new Date();
      const s = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const e = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      url += `?startDate=${s}&endDate=${e}`;
    } else if (filterType === "mois") {
      const now = new Date();
      const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      url += `?startDate=${s}&endDate=${e}`;
    } else if (filterType === "annee") {
      const now = new Date();
      const s = new Date(now.getFullYear(), 0, 1).toISOString();
      const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
      url += `?startDate=${s}&endDate=${e}`;
    }
  
    try {
      const { data } = await axios.get(url);
      setTotals(data);
    } catch (error) {
      console.error("Erreur de récupération:", error);
    }
  };
  
  useEffect(() => {
    fetchTotals();
  }, [filterType, startDate, endDate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />
       <Box sx={{ flexGrow: 1, overflow: "hidden"}}>
        <Header />
          <Container maxWidth="xl" sx={{ p: 3, mb: 4,mt:5 }}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Package size={32} className="text-primary mr-2" />
                      <Typography variant="h4" color="primary">
                        Gestion des stocks
                      </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                    {/* Filtre période */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            select
                            fullWidth
                            label="Période"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                          >
                            <MenuItem value="jour">Aujourd’hui</MenuItem>
                            <MenuItem value="mois">Ce mois</MenuItem>
                            <MenuItem value="annee">Cette année</MenuItem>
                            <MenuItem value="personnalise">Période personnalisée</MenuItem>
                          </TextField>
                        </Grid>

                        {filterType === "personnalise" && (
                          <>
                            <Grid item xs={12} sm={4}>
                              <DatePicker
                                label="Date de début"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                slotProps={{ textField: { fullWidth: true } }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <DatePicker
                                label="Date de fin"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                slotProps={{ textField: { fullWidth: true } }}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>

                      {/* Quick Stats */}
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Package size={24} className="text-primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Total Produits
                              </Typography>
                              <Typography variant="h6">{prod}</Typography>
                            </Box>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AlertTriangle size={24} className="text-warning" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Stock Faible
                              </Typography>
                              <Typography variant="h6">10</Typography>
                            </Box>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ArrowUpRight size={24} className="text-success" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Entrées ({filterType})
                              </Typography>
                              <Typography variant="h6">{totals?.total_entree ?? 0}</Typography>
                            </Box>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ArrowDownRight size={24} className="text-error" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Sorties ({filterType})
                              </Typography>
                              <Typography variant="h6">{totals?.total_sortie ?? 0}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>

                      </LocalizationProvider>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab icon={<Package size={20} />} label="État des stocks" />
                        <Tab icon={<FileText size={20} />} label="Mouvements" />
                      </Tabs>
                    </Box>

                    {/* Stock Status Tab */}
                    <TabPanel value={tabValue} index={0}>
                      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          placeholder="Rechercher un produit..."
                          size="small"
                          sx={{ minWidth: 300 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search size={20} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<Filter size={20} />}
                        >
                          Filtres
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshCcw size={20} />}
                        >
                          Actualiser
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                       
                      </Box>

                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Code</TableCell>
                              <TableCell>Produit</TableCell>
                              <TableCell>Catégorie</TableCell>
                              <TableCell align="right">Quantité</TableCell>
                              <TableCell align="right">Stock min.</TableCell>
                              <TableCell>Fournisseur</TableCell>
                              <TableCell>Dernière MAJ</TableCell>
                              <TableCell>Statut</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stockactu.map((stock) => (
                              <TableRow key={stock.id}>
                                <TableCell>{stock.code_stock}</TableCell>
                                <TableCell>{stock.label}</TableCell>
                                <TableCell>{stock.categorie_nom}</TableCell>
                                <TableCell align="right">{stock.quantite_actuelle}</TableCell>
                                <TableCell align="right">{stock.minStock}</TableCell>
                                <TableCell>{stock.nom}</TableCell>
                                <TableCell>{new Date(stock.date_modif).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                  })}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={stock.status}
                                    color={getStatusColor(stock.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton size="small">
                                    <MoreVertical size={20} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TabPanel>

                    {/* Stock Movements Tab */}
                    <TabPanel value={tabValue} index={1}>
                      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          placeholder="Rechercher..."
                          size="small"
                          sx={{ minWidth: 150 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search size={20} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Filtrer par date"
                            value={dateFilter}
                            onChange={(newValue) => setDateFilter(newValue)}
                            slotProps={{
                              textField: {
                                size: 'small',
                                sx: { width: 150 },
                              },
                            }}
                          />
                        </LocalizationProvider>
                        
                        <Box sx={{ flexGrow: 1 }} />
                        {typeFilter && (
                          <Button
                            variant="outlined"
                            onClick={() => setTypeFilter(null)}
                            startIcon={<X size={20} />}
                          >
                            Réinitialiser filtre
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<PackagePlus size={20} />}
                          onClick={() => setTypeFilter('Entrée')}
                        >
                          Entrée stock
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<PackageMinus size={20} />}
                          onClick={() => setTypeFilter('Sortie')}
                        >
                          Sortie stock
                        </Button>
                      </Box>

                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Catégorie</TableCell>
                              <TableCell>Produit</TableCell>
                              <TableCell align="right">Quantité</TableCell>
                              <TableCell>Date Entrée/Sortie</TableCell>
                              <TableCell>Source/Destination</TableCell>
                              <TableCell>Statut</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          {stocks
                          .filter(stock => typeFilter ? stock.type === typeFilter : true)
                          .map((stock) => (
                              stock.produits.map((produit, index) => (
                              <TableRow key={`${stock._id}-${produit.produit_id?._id || index}-${stock.type}`}>
                                <TableCell>
                                  <Chip
                                    label={stock.type}
                                    color={getMovementColor(stock.type)}
                                    size="small"
                                    icon={stock.type === 'Entrée' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                  />
                                </TableCell>
                                <TableCell>{produit.categorie_id?.nom}</TableCell>
                                <TableCell>{produit.produit_id?.label}</TableCell>
                                <TableCell align="right">{produit.quantite_entree || produit.quantite_sortie || "N/A"}</TableCell>
                                <TableCell>{new Date(stock.date_modif).toLocaleDateString()}</TableCell>
                                <TableCell>{stock.fournisseur_id?.nom || stock.client_id?.nom || "—"}</TableCell>
                                <TableCell>{stock.status}</TableCell>
                                <TableCell align="right">
                                  <IconButton size="small">
                                    <MoreVertical size={20} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                              ))
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TabPanel>


                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>


    </ThemeProvider>


    )
  }


export default Stocks;
