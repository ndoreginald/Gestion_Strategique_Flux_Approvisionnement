import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertColor, CircularProgress } from '@mui/material';

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
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CancelIcon from '@mui/icons-material/Cancel';
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
  ShoppingCart,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Package,
  X,
  CircleX,
  ClipboardCheck,
  HandCoins,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
//import { BanknoteArrowDown } from 'lucide-react';
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
    case 'En cours':
      return 'info';
    case 'Remboursée':
      return 'warning';
    case 'Validée':
      return 'success';
    case 'Annulée':
      return 'error';
    default:
      return 'default';
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

function getStatusIcon(status: string) {
  switch (status) {
    case 'En cours':
      return <FileText size={16} />;
    case 'Validée':
      return <AlertTriangle size={16} />;
    case 'Remboursée':
      return <CheckCircle2 size={16} />;
    case 'Annulée':
      return <XCircle size={16} />;
    default:
      return null;
  }
}

interface SaleDetailsProps {
  open: boolean;
  onClose: () => void;
  sale: {
    num_vente: string;
    client: string;
    date_vente: string;
    mode_paiement: string;
    total_ht: string;
    total_ttc: string;
    statut: string;
    produits: Array<{
      nom: string;
      quantite: number;
      prix_unitaire: number;
      total: number;
    }>;
  } | null;
}

function Vente () {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  // Ouvre le dialogue
const confirmStatusChange = (id: string, newStatus: string) => {
  setPendingStatus(newStatus);
  setPendingId(id);
  setDialogOpen(true);
};

// Confirme et change le statut
// Modifiez handleConfirmChange comme suit :
const handleConfirmChange = async () => {
  if (pendingId && pendingStatus) {
    await handleChangeStatus(pendingId, pendingStatus);
    fetchOrders(); 
  }
  setDialogOpen(false);
  setPendingId(null);        
  setPendingStatus(null);
};

// Annule
const handleCancelled = () => {
  setDialogOpen(false);
  setPendingId(null);
  setPendingStatus(null);
};


  const handleCloseSnackbar = () => {setSnackbar({ ...snackbar, open: false }); };
  const [formData, setFormData] = useState({
    client_id: '',
    num_vente: 0,
    statut: '',
    remise: 0,
    taxes: 0,
    total_ht: 0,
    total_ttc: 0,
    date_vente: new Date().toISOString().split('T')[0],
    produits: [{ produit_id: '',label:'', quantite: '', prix_unitaire: '', total: 0 }],
  });

  const isValidId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    useEffect(() => {
      const accessToken = sessionStorage.getItem("accessToken");

        if (!accessToken) {
          navigate('/');
          return;
        }
      if (id && accessToken) {
        axios.get(`http://localhost:4001/gestionFluxDB/vente/${id}`,
          {
        headers: { 'Authorization': `Bearer ${accessToken}`
      }
      }) 
          .then(response => {
            setSelectedOrder(response.data);
            setDetailsDialogOpen(true); // Ouvrir le dialog automatiquement
          })
          .catch(error => console.error('Error fetching vente data:', error));
      }
    }, [id]);
  

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
  
        const response = await axios.get('http://localhost:4001/gestionFluxDB/vente/', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const formattedOrders = response.data.map((order: any) => ({
          id: order._id,
          num_vente: order.num_vente,
          client: order.client_id?.nom || 'Non spécifié',
          user: order.user_id?.nom || 'Non spécifié',
          date_vente: dayjs(order.date_vente).format('DD/MM/YYYY'),
          mode_paiement: order.mode_paiement,
          //date_livraison: order.deliveryDate ? dayjs(order.deliveryDate).format('DD/MM/YYYY') : 'Non spécifié',
          //date_prevu: order.date_prevu ? dayjs(order.date_prevu).format('DD/MM/YYYY') : 'Non spécifié',
          total_ht: order.total_ht.toFixed(2),
          total_ttc: order.total_ttc.toFixed(2),
          statut: order.statut,
          produits: order.produits,
        }));
  
        setOrders(formattedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des ventes:', error);
        setLoading(false);
      }
    };
  
    const handleCancel = async (id: string) => {
      try {
        const response = await axios.put(`http://localhost:4001/gestionFluxDB/vente/${id}`, { 
          statut: 'Annulée' 
        });
  
        if (response.status === 200) {
          fetchOrders(); // Refresh the orders list
        }
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la vente:', error);
      }
    };


    const handleChangeStatus = async (id: string, newStatus: string) => {
      if (loading) return;
    
      setLoading(true);
      try {
        const response = await axios.put(
          `http://localhost:4001/gestionFluxDB/vente/status/${id}`, 
          { statut: newStatus }
        );
    
        setFormData(response.data);
        setSelectedOrder(null);
        setDeleteDialogOpen(false);
        
      } catch (error: any) {
        console.error('Erreur:', {
          message: error.message,
          response: error.response?.data
        });
      } finally {
        setLoading(false);
      }
    };
    
    
  
    const columns: GridColDef[] = [
      {
        field: 'num_vente',
        headerName: 'N° Vente',
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'client',
        headerName: 'Client',
        width: 200,
      },
      {
        field: 'date_vente',
        headerName: 'Date de Vente',
        width: 150,
      },
      {
        field: 'mode_paiement',
        headerName: 'Mode paiement',
        width: 150,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value}
            color={getPaymentColor(params.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />
        ),
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
          const isDisabled = params.row.statut === 'Validée' || params.row.statut === 'Annulée' || params.row.statut === 'Remboursée';
          
          return (
            <Box>
              <Tooltip title="Voir les détails">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/vente/${params.row.id}`)} 
                >
                  <Eye size={18} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Valider">
                <span>
                  <IconButton
                    size="small"
                    //onClick={() => handleChangeStatus('Validée')}
                    onClick={() => confirmStatusChange(params.row.id,'Validée')}
                    disabled={isDisabled || loading}
                  >
                   {loading ? <CircularProgress size={18} /> : <ClipboardCheck size={18} />}
                  </IconButton>
                </span>
              </Tooltip>
  
              <Tooltip title="Annuler">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    //onClick={() => handleChangeStatus('Annulée')} //confirmStatusChange
                    onClick={() => confirmStatusChange(params.row.id,'Annulée')}
                    disabled={isDisabled}
                  >
                  <CircleX size={18}/>
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Rembourser">
                <span>
                  <IconButton
                    size="small"
                    color="warning"
                    //onClick={() => handleChangeStatus('Remboursée')}
                    onClick={() => confirmStatusChange(params.row.id,'Remboursée')}
                    disabled={isDisabled}
                  >
                  <HandCoins size={18}/>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ];

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
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2, }}>
                      <ShoppingCartCheckoutIcon sx={{ color: "primary.main", fontSize: 34, mr: 1 }} />
                      <Typography variant="h4" color="primary">
                        Liste de Ventes
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
                      onClick={() => navigate('/vente/add-vente')}
                    >
                      Nouvelle Vente
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
              Détails de la Vente #{selectedOrder?.num_vente || ''}
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
                      Client: <strong>{selectedOrder.client_id.nom}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tel: <strong>{selectedOrder.client_id.telephone}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Adresse: <strong>{selectedOrder.client_id.adresse}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <User size={20} color='blue'/>
                    <Typography variant="body2" color="text.secondary">
                      Saisi Par: <strong>{selectedOrder.user_id.nom}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Date: <strong>{selectedOrder.date_vente}</strong>
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
                    Vente effectuée: <strong>{selectedOrder.type_vente}</strong>
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
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="right">Prix unitaire</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Total TTC</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.produits?.map((product: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{product.produit_id.label}</TableCell>
                          <TableCell align="right">{product.quantite}</TableCell>
                          <TableCell align="right">{product.prix_unitaire?.toFixed(2)} €</TableCell>
                          <TableCell align="right">{product.total?.toFixed(2)} €</TableCell>
                          <TableCell align="right">{selectedOrder.total_ttc?.toFixed(2)} €</TableCell>
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

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCancel}>
  <DialogTitle>Confirmation</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Êtes-vous sûr de vouloir changer le statut à <strong>{pendingStatus}</strong> ?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancelled} color="secondary">
      Annuler
    </Button>
    <Button onClick={handleConfirmChange} color="primary" autoFocus>
      Confirmer
    </Button>
  </DialogActions>
</Dialog>

    
    </ThemeProvider>
      </>
    )
  }


export default Vente
