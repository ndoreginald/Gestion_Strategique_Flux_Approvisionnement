import React, { useEffect, useState } from 'react';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  Receipt,
  ShoppingCart,
  X,
  User,
  Calendar,
  CreditCard,
  Package,
  ListIcon,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
//import 'dayjs/locale/fr';

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

function getStatusColor(status: string) {
  switch (status) {
    case 'Commandé':
      return 'info';
    case 'En_cours_de_livraison':
      return 'info';
    case 'Réception partielle':
      return 'warning';
    case 'Reçue':
      return 'success';
    case 'annuler':
      return 'error';
    default:
      return 'default';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Commandé':
      return <FileText size={16} />;
    case 'En cours de livraison':
      return <AlertTriangle size={16} />;
    case 'confirmé':
    case 'Reçue':
      return <CheckCircle2 size={16} />;
    case 'retard':
    case 'annuler':
      return <XCircle size={16} />;
    default:
      return null;
  }
}

function getPaymentColor(mode_paiement: string) {
  switch (mode_paiement) {
    case 'Carte':
      return 'info';
    case 'Espèces':
      return 'warning';
    case 'Virement':
      return 'success';
    default:
      return 'default';
  }
}


function PurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const navigate = useNavigate();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { id } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const isValidId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);


useEffect(() => {
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    navigate('/');
    return;
  }

  if (!id) return;

  const fetchAchat = async () => {
    try {
      const response = await axios.get(`http://localhost:4001/gestionFluxDB/achat/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setSelectedOrder(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching achat data:', error);
    }
  };

  fetchAchat();
}, [id, navigate]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      const response = await axios.get('http://localhost:4001/gestionFluxDB/achat/', {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const formattedOrders = response.data.map((order: any) => ({
        id: order._id,
        num_achat: order.num_achat,
        fournisseur: order.fournisseur_id?.nom || 'Non spécifié',
        user: order.user_id?.nom || 'Non spécifié',
        date_achat: dayjs(order.date_achat).format('DD/MM/YYYY'),
        date_livraison: order.deliveryDate ? dayjs(order.deliveryDate).format('DD/MM/YYYY') : 'Non spécifié',
        date_prevu: order.date_prevu ? dayjs(order.date_prevu).format('DD/MM/YYYY') : 'Non spécifié',
        total_ht: order.total_ht.toFixed(2),
        total_ttc: order.total_ttc.toFixed(2),
        statut: order.statut,
        produits: order.produits,
      }));

      setOrders(formattedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setLoading(false);
    }
  };


const handleCancel = async (id: string) => {
    console.log("Annulation en cours pour l'achat ID :", id); // ✅ Vérifie si cette ligne s'affiche
    try {
      const response = await axios.put(`http://localhost:4001/gestionFluxDB/achat/${id}`, { statut: 'annuler' });
      console.log("Réponse du serveur :", response); // ✅ Affiche la réponse du serveur
      if (response.status === 200) {
        setOrders(orders.map(order => 
          order._id === id ? { ...order, statut: 'annuler' } : order
        ));
      } else {
        console.error('Erreur lors de l\'annulation de l\'achat :', response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'achat :', error);
    }
};


  const handleNavigate = (achatId: string | undefined) => {
    if (!achatId || !isValidId(achatId)) {
      navigate('/achats/list-achats', { state: { error: "ID invalide" } });
    } else {
      navigate(`/reception/${achatId}`);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'num_achat',
      headerName: 'N° Commande',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'fournisseur',
      headerName: 'Fournisseur',
      width: 200,
    },
    {
      field: 'date_achat',
      headerName: 'Date de commande',
      width: 150,
    },
    {
      field: 'date_prevu',
      headerName: 'Livraison prévue',
      width: 150,
    },
    {
      field: 'total_ttc',
      headerName: 'Total TTC',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value} €
        </Typography>
      ),
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ minWidth: 120 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const isDisabled = params.row.statut === 'Reçue' || params.row.statut === 'annuler';
        
        return (
          <Box>
            <Tooltip title="Voir les détails">
              <IconButton
                size="small"
                onClick={() => navigate(`/PurchaseOrders/${params.row.id}`)}
                
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Valider commande">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleNavigate(params.row.id)}
                  disabled={isDisabled}
                >
                  <Edit3 size={18} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Annuler commande">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleCancel(params.row.id)}
                  disabled={isDisabled}
                >
                  <Trash2 size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2, }}>
                               <ShoppingCartCheckoutIcon sx={{ color: "primary.main", fontSize: 28, mr: 1 }} />
                               <Typography variant="h6" fontWeight="bold" color="primary">
                                 Liste des Achats
                               </Typography>
                             </Box>
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <TextField
                      fullWidth
                      placeholder="Rechercher..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={20} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: '20%' }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => navigate('/achats/add-achat')}
                      >
                        Nouvelle commande
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate(`/validation/list-validations`)} 
                        startIcon={<ListIcon />}
                      >
                        liste validations
                      </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ height: 600, width: '100%' }}>
                      <DataGrid
                        rows={orders}
                        columns={columns}
                        loading={loading}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        sx={{
                          border: 'none',
                          '& .MuiDataGrid-cell': {
                            borderColor: 'divider',
                          },
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'primary.main',
                            //color: 'white',
                            fontWeight: 'bold',
                          },
                          '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Voir_details Confirmation Dialog */}
            <Dialog 
              open={detailsDialogOpen} 
              onClose={() => setDetailsDialogOpen(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCart size={24} />
                  <Typography variant="h5" component="span" fontWeight="bold">
                    Détails de l'achat #{selectedOrder?.num_achat || ''}
                  </Typography>
                </Box>
                <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
                  <X size={20} />
                </IconButton>
              </DialogTitle>
      
              <DialogContent sx={{ mt: 2 }}>
                {selectedOrder ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 3, 
                        flexWrap: 'wrap',
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Receipt size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Statut:
                            <Chip 
                              label={selectedOrder.statut}
                              color={getStatusColor(selectedOrder.statut)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Box>
      
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <User size={20} color='red'/>
                          <Typography variant="body2" color="text.secondary">
                            Fournisseur: <strong>{selectedOrder.fournisseur_id?.nom}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tel: <strong>{selectedOrder.fournisseur_id?.telephone}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Adresse: <strong>{selectedOrder.fournisseur_id?.adresse}</strong>
                          </Typography>
                        </Box>
      
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <User size={20} color='blue'/>
                          <Typography variant="body2" color="text.secondary">
                            Saisi Par: <strong>{selectedOrder.user_id?.nom}</strong>
                          </Typography>
                        </Box>
      
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Date Commande: <strong>{selectedOrder.date_achat}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date livraison: <strong>{selectedOrder.date_prevu}</strong>
                          </Typography>
                        </Box>
      
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCard size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Paiement:
                            <Chip 
                              label={selectedOrder.mode_paiement}
                              color={getPaymentColor(selectedOrder.mode_paiement)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                          Terme de paiement: <strong>{selectedOrder.paymentTerms}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                          Mode de paiement: <strong>{selectedOrder.mode_paiement}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
      
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Package size={20} />
                        Produits
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Produit</TableCell>
                              <TableCell align="right">Quantité Commandée</TableCell>
                              <TableCell align="right">Prix unitaire</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrder.produits?.map((product: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{product.produit_id.label}</TableCell>
                                <TableCell align="right">{product.quantite}</TableCell>
                                <TableCell align="right">{product.prix_unitaire?.toFixed(2)} €</TableCell>
                                <TableCell align="right">{product.total?.toFixed(2)} €</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
      
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1,
                        alignItems: 'flex-end',
                        mt: 2
                      }}>
                        <Typography variant="body1">
                          Transport: <strong>{selectedOrder.frais_transport || 0} €</strong>
                        </Typography>
                        <Typography variant="body1">
                          Total HT: <strong>{selectedOrder.total_ht} €</strong>
                        </Typography>
                        <Typography variant="h6" color="primary">
                          Total TTC: <strong>{selectedOrder.total_ttc} €</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography>Aucune donnée disponible</Typography>
                )}
              </DialogContent>
            </Dialog>

    </ThemeProvider>
  );
}

export default PurchaseOrders;