import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Grid,
  useTheme,
  Divider, 
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

interface BudgetSummary {
  annualTotals: {
    allocated: number;
    committed: number;
    consumed: number;
    remaining: number;
    totalSpent?: number;
    utilizationRate?: number;
  };
  byStatus: {
    Validé: number;
    En_attente?: number;
    Brouillon: number;
    Rejeté: number;
    Clôturé?: number;
  };
  budgets: Array<{
    utilizationRate: number;
    [key: string]: any;
  }>;
}

const BudgetOverview: React.FC = () => {
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetSummary = async (selectedYear: number) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = sessionStorage.getItem("accessToken");
           if (!accessToken) {
                console.error("Token manquant. Veuillez vous reconnecter.");
                return;
              }
      const response = await axios.get(`http://localhost:4001/gestionFluxDB/budget/budgets/summary/${selectedYear}`, 
        {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('data',response.data);
      setSummary(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des données budgétaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetSummary(year);
  }, [year]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = Number(e.target.value);
    if (newYear >= 2000 && newYear <= 2100) {
      setYear(newYear);
    }
  };
  
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };


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
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Budget Overview - {year}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : !summary ? (
          <Alert severity="info" sx={{ my: 2 }}>
            Aucune donnée disponible
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <TextField
                label="Année"
                type="number"
                value={year}
                onChange={handleYearChange}
                inputProps={{ min: 2000, max: 2100 }}
                sx={{ width: 150 }}
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">Total Alloué</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    {formatCurrency(summary.annualTotals.allocated)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">Total Reception</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                    {formatCurrency(summary.annualTotals.consumed)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">Total Commande</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                    {formatCurrency(summary.annualTotals.committed)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Budget Utilization</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {summary.annualTotals.utilizationRate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={summary.annualTotals.utilizationRate} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 
                      summary.annualTotals.utilizationRate > 90 ? theme.palette.error.main :
                      summary.annualTotals.utilizationRate > 75 ? theme.palette.warning.main :
                      theme.palette.success.main
                  }
                }} 
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Budget Status</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                    {summary.byStatus.Validé || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Validé</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                    {summary.byStatus.En_attente || summary.byStatus.Brouillon || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {summary.byStatus.En_attente !== undefined ? 'En attente' : 'Brouillon'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                    {summary.byStatus.Clôturé || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Clôturé</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                    {summary.byStatus.Rejeté || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Rejeté</Typography>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;