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
  Stack,
  LinearProgress,
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
  DollarSign,
  TrendingUp,
  Users,
  PieChart,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import axios from 'axios';
import { MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from "@mui/icons-material/Add";
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';


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

function Devis() {
     const [filterType, setFilterType] = useState("mois");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [stockactu, setStockactu] = useState<any[]>([]);
    const [totals, setTotals] = useState({ total_entree: 0, total_sortie: 0 });

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

      const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
          setTabValue(newValue);
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

    const StatCard = ({ icon, title, value, subtitle, trend, color }: any) => (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box color={color}>{icon}</Box>
            </Box>
            {trend && (
              <Chip icon={<TrendingUp />} label={trend} color="success" size="small" />
            )}
          </Box>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
          <Typography color="text.secondary">{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Paper>
      );
    
      const StatusChart = () => {
        const total = Object.values(stats.statusDistribution).reduce((sum, count) => sum + count, 0);
        const statusLabels: Record<string, string> = {
          draft: 'Brouillons',
          sent: 'Envoyés',
          approved: 'Approuvés',
          rejected: 'Rejetés',
          expired: 'Expirés'
        };
        const statusColors: Record<string, string> = {
          draft: theme.palette.grey[500],
          sent: theme.palette.info.main,
          approved: theme.palette.success.main,
          rejected: theme.palette.error.main,
          expired: theme.palette.warning.main
        };
    
        return (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PieChart style={{ marginRight: 8 }} />
              <Typography variant="h6">Répartition par statut</Typography>
            </Box>
            <Stack spacing={2}>
              {Object.entries(stats.statusDistribution).map(([status, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <Box key={status} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography flex={1}>{statusLabels[status]}</Typography>
                    <Box width={120} mr={2}>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 8, borderRadius: 5, backgroundColor: '#f0f0f0', '& .MuiLinearProgress-bar': { backgroundColor: statusColors[status] } }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{count}</Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        );
      };
    
    const stats = {
      totalQuotes: 42,
      totalAmount: 14890,
      averageAmount: 354.52,
      statusDistribution: {
        draft: 10,
        sent: 12,
        approved: 15,
        rejected: 3,
        expired: 2
      },
      monthlyTrend: [
        { month: 'Janvier', amount: 1200, count: 4 },
        { month: 'Février', amount: 1900, count: 5 },
        { month: 'Mars', amount: 2200, count: 6 },
        { month: 'Avril', amount: 1850, count: 5 },
        { month: 'Mai', amount: 1700, count: 4 },
        { month: 'Juin', amount: 1350, count: 3 },
        { month: 'Juillet', amount: 2100, count: 5 },
        { month: 'Août', amount: 290, count: 2 },
        { month: 'Septembre', amount: 800, count: 2 },
        { month: 'Octobre', amount: 500, count: 1 },
        { month: 'Novembre', amount: 0, count: 0 },
        { month: 'Décembre', amount: 500, count: 1 },
      ]
    };

    const TrendChart = () => {
    const maxAmount = Math.max(...stats.monthlyTrend.map(item => item.amount));
    return (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Calendar style={{ marginRight: 8 }} />
              <Typography variant="h6">Évolution mensuelle</Typography>
            </Box>
            <Stack spacing={2}>
              {stats.monthlyTrend.map((item, index) => {
                const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                return (
                  <Box key={index}>
                    <Typography variant="body2" gutterBottom>{item.month}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 10, borderRadius: 5, backgroundColor: '#e0e0e0' }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">{item.count} devis</Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        );
      };
    
    const navigate = useNavigate();
  
    return (
      <>
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
                    <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3
                    }}
                  >
                    <Typography variant="h4" color="text.primary">
                      Gestion des dévis
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate(`/devis/add-devis`)
                      }
                    >
                      Créer un dévis
                    </Button>
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
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            icon={<FileText />} title="Total des devis" value={stats.totalQuotes}
                            subtitle="Tous statuts confondus" trend="+12%" color={theme.palette.primary.main} />
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            icon={<DollarSign />} title="Chiffre d'affaires"
                            value={stats.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            subtitle="Montant total des devis" trend="+8%" color={theme.palette.success.main} />
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            icon={<TrendingUp />} title="Montant moyen"
                            value={stats.averageAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            subtitle="Par devis" trend="+5%" color={theme.palette.secondary.main} />
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            icon={<Users />} title="Taux d'approbation"
                            value={`${Math.round((stats.statusDistribution.approved / stats.totalQuotes) * 100)}%`}
                            subtitle={`${stats.statusDistribution.approved} devis approuvés`} trend="+3%" color={theme.palette.warning.main} />
                        </Grid>
                    </Grid>

                      </LocalizationProvider>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab icon={<Package size={20} />} label="État des dévis" />
                        <Tab icon={<FileText size={20} />} label="Statistiques" />
                      </Tabs>
                    </Box>

                    {/* Devis Status Tab */}
                    <TabPanel value={tabValue} index={0}>
                      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          placeholder="Rechercher..."
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

                    {/* Stast Devis Tab */}
                    <TabPanel value={tabValue} index={1}>
                      
                    <Grid container spacing={3} mt={2}>
                        
                    {/* Statuts détaillés */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Statuts détaillés</Typography>
                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">Brouillons</Typography>
                            <Typography fontWeight="bold">{stats.statusDistribution.draft}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">En attente</Typography>
                            <Typography fontWeight="bold" color="info.main">{stats.statusDistribution.sent}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">Approuvés</Typography>
                            <Typography fontWeight="bold" color="success.main">{stats.statusDistribution.approved}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">Rejetés</Typography>
                            <Typography fontWeight="bold" color="error.main">{stats.statusDistribution.rejected}</Typography>
                            </Box>
                        </Stack>
                        </Paper>
                    </Grid>

                    {/* Performance */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Performance</Typography>
                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">Conversion</Typography>
                            <Typography fontWeight="bold" color="success.main">
                                {Math.round((stats.statusDistribution.approved / (stats.statusDistribution.sent + stats.statusDistribution.approved + stats.statusDistribution.rejected)) * 100)}%
                            </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">En cours</Typography>
                            <Typography fontWeight="bold" color="info.main">{stats.statusDistribution.sent}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                            <Typography color="text.secondary">À traiter</Typography>
                            <Typography fontWeight="bold" color="warning.main">{stats.statusDistribution.draft}</Typography>
                            </Box>
                        </Stack>
                        </Paper>
                    </Grid>

                    {/* Actions recommandées */}
                    <Grid item xs={12} md={12} lg={4}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Actions recommandées</Typography>
                        <Stack spacing={2}>
                            {stats.statusDistribution.draft > 0 && (
                            <Box p={2} sx={{ bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main', borderRadius: 2 }}>
                                <Typography fontWeight="bold" sx={{ color: '#fff' }}>
                                {stats.statusDistribution.draft} devis en brouillon
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>À finaliser et envoyer</Typography>
                            </Box>
                            )}
                            {stats.statusDistribution.sent > 0 && (
                            <Box p={2} sx={{ bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main', borderRadius: 2 }}>
                                <Typography fontWeight="bold" sx={{ color: '#fff' }}>
                                {stats.statusDistribution.sent} devis en attente
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>Relancer les clients</Typography>
                            </Box>
                            )}
                            {stats.statusDistribution.expired > 0 && (
                            <Box p={2} sx={{ bgcolor: 'error.light', border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}>
                                <Typography fontWeight="bold" sx={{ color: '#fff' }}>
                                {stats.statusDistribution.expired} devis expirés
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>Renouveler si nécessaire</Typography>
                            </Box>
                            )}
                        </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                            <StatusChart />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TrendChart />
                        </Grid>
                    </Grid>

                    </TabPanel>


                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>


    </ThemeProvider>
      </>
    )
  }

export default Devis
