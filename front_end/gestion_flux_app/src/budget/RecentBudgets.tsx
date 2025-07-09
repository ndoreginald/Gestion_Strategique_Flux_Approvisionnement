import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const statusColors: Record<string, string> = {
  Validé: 'success',
  Brouillon: 'info',
  Clôturé: 'error'
};

const RecentBudgets: React.FC = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
           if (!accessToken) {
                console.error("Token manquant. Veuillez vous reconnecter.");
                return;
              }
        const response = await axios.get('http://localhost:4001/gestionFluxDB/budget/',
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        ); 
        console.log(response);
        setBudgets(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des budgets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const recentBudgets = budgets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{
      height: '100%',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Budgets récents
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Utilisation</TableCell>
                <TableCell align="right">Montant</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBudgets.map((budget) => {
                const spent = budget.categories.reduce(
                  (acc: number, cat: any) => acc + (cat.committedAmount || 0),
                  0
                );
                const utilizationRate = budget.budgetAmount
                  ? (spent / budget.budgetAmount) * 100
                  : 0;

                return (
                  <TableRow key={budget._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {budget.reference}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {budget.period}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={budget.status}
                        color={statusColors[budget.status] as any}
                        size="small"
                        sx={{ height: 24, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={utilizationRate}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                utilizationRate > 90
                                  ? theme.palette.error.main
                                  : utilizationRate > 75
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {utilizationRate.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(budget.budgetAmount)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Voir les détails">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier le budget">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Autres options">
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentBudgets;
