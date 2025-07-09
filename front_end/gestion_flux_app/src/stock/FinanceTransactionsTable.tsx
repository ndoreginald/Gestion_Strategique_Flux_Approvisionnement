import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  MoreVertical,
  FileText,
  Copy,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { formatCurrency, formatDate } from './formatters';
import { Transaction } from './types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import { Transaction } from '../../types/types';
//import { formatCurrency, formatDate } from '../../utils/formatters';

interface FinanceTransactionsTableProps {
  transactions: Transaction[];
}

export const FinanceTransactionsTable: React.FC<FinanceTransactionsTableProps> = ({ 
  transactions 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transactionId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTransaction(transactionId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTransaction(null);
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'Entrée':
        return 'success';
      case 'Sortie':
        return 'error';
      default:
        return 'default';
    }
  };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const accessToken = sessionStorage.getItem("accessToken");
          if (!accessToken) {
            console.log("❌ Token manquant. Redirection...");
            navigate('/');
            return;
          }
          const response = await axios.get('http://localhost:4001/gestionFluxDB/stock/combined', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          setData(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  const getStatusIcon = (type: string) => {
    return type === 'Entrée' ? 
      <ArrowUpRight size={16} /> : 
      <ArrowDownRight size={16} />;
  };

  // Fonction de formatage de la monnaie
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(value || 0);
};

// Fonction de formatage de date
const formatDate = (dateString: string | number | Date) => {
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
     <TableContainer sx={{ maxHeight: 600 }}>
  <Table stickyHeader aria-label="finance transactions table">
    <TableHead>
      <TableRow>
        <TableCell sx={{ fontWeight: 600 }}>Référence</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Produit</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>Quantité</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>Prix unitaire</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>Montant total</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Fournisseur/Client</TableCell>
        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data
        ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        ?.map((transaction) => {
          // Vérification sécurisée des produits
          const produits = transaction?.produits || [];
          const mainProduct = produits[0] || {};
          const produitId = mainProduct?.produit_id || {};
          const categorieId = mainProduct?.categorie_id || {};
          
          const isVente = transaction?.type === 'vente';
          const reference = transaction?.id 
            ? `${isVente ? 'VNT' : 'RCP'}-${transaction.id.slice(-4)}` 
            : 'N/A';

          return (
            <TableRow
              hover
              key={transaction?.id || Math.random()}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                transition: 'background-color 0.2s',
              }}
            >
              <TableCell>{reference}</TableCell>
              <TableCell>
                {transaction?.date ? formatDate(transaction.date) : 'N/A'}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={transaction?.type?.toUpperCase() || 'N/A'}
                  color={isVente ? 'success' : 'primary'}
                  icon={isVente ? <ShoppingCart size={16} /> : <Truck size={16} />}
                />
              </TableCell>
              <TableCell>{produitId?.label || 'N/A'}</TableCell>
              <TableCell>
                {typeof categorieId === 'object' 
                  ? categorieId?.nom || 'N/A'
                  : 'N/A'}
              </TableCell>
              <TableCell align="right">
                {isVente 
                  ? mainProduct?.quantite || 0 
                  : mainProduct?.quantite_reçu || 0}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(mainProduct?.prix_unitaire)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(transaction?.montant)}
              </TableCell>
              <TableCell>
                {isVente
                  ? transaction?.client?.nom || 'Client inconnu'
                  : transaction?.fournisseur?.nom || 'Fournisseur inconnu'}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Plus d'options">
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, transaction?.id)}
                  >
                    <MoreVertical size={20} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
    </TableBody>
  </Table>
</TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
      />
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <FileText size={18} />
          </ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit size={18} />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Copy size={18} />
          </ListItemIcon>
          <ListItemText>Dupliquer</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Trash2 size={18} />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};