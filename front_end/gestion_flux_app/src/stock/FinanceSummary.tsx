import React from 'react';
import { 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  LinearProgress,
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  BarChart2 
} from 'lucide-react';
import { formatCurrency } from './formatters';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FinanceData {
  totalInventoryValue: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
  grossProfit: number;
  profitMargin: number;
  trends?: {
    inventory: number;
    purchases: number;
    sales: number;
    profit: number;
  };
}

export const FinanceSummary = () => {
  const theme = useTheme();
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:4001/gestionFluxDB/stock/monthly-comparison', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        // Transformation des données pour correspondre à votre structure frontend
        setData({
          totalInventoryValue: response.data.stock.currentValue,
          totalPurchaseValue: response.data.receptions.currentMonth,
          totalSalesValue: response.data.ventes.currentMonth,
          grossProfit: response.data.margeBrute.currentMonth,
          profitMargin: response.data.margeBrute.margePercentage,
          trends: {
            inventory: response.data.stock.evolution,
            purchases: response.data.receptions.evolution,
            sales: response.data.ventes.evolution,
            profit: response.data.margeBrute.evolution
          }
        });
        
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const getTrendText = (value: number) => {
    const trend = value >= 0 ? '+' : '';
    return `${trend}${value.toFixed(2)}% depuis le mois dernier`;
  };

  const summaryCards = [
    {
      title: 'Valeur d\'Inventaire',
      value: data.totalInventoryValue,
      icon: <ShoppingCart size={24} />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light,
      change: getTrendText(data.trends?.inventory || 0),
      isPositive: (data.trends?.inventory || 0) >= 0
    },
    {
      title: 'Achats Totaux',
      value: data.totalPurchaseValue,
      icon: <BarChart2 size={24} />,
      color: theme.palette.error.main,
      bgColor: theme.palette.error.light,
      change: getTrendText(data.trends?.purchases|| 0),
      isPositive: (data.trends?.purchases || 0) >= 0
    },
    {
      title: 'Ventes Totales',
      value: data.totalSalesValue,
      icon: <DollarSign size={24} />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light,
      change: getTrendText(data.trends?.sales|| 0),
      isPositive: (data.trends?.sales || 0) >= 0
    },
    {
      title: 'Marge Brute',
      value: data.grossProfit,
      icon: <TrendingUp size={24} />,
      color: '#7C4DFF',
      bgColor: 'rgba(124, 77, 255, 0.1)',
      change: `Marge de ${getTrendText(data.trends?.profit)}`,
      isPositive: data.grossProfit >= 0,
      showProgress: true,
      progressValue: data.profitMargin
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {summaryCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2.5, 
              height: '100%', 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {card.title}
              </Typography>
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: '50%', 
                  bgcolor: card.bgColor,
                  color: card.color
                }}
              >
                {card.icon}
              </Box>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              {formatCurrency(card.value)}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: card.showProgress ? 1 : 0 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: card.isPositive ? 'success.main' : 'error.main',
                  fontWeight: 500
                }}
              >
                {card.change}
              </Typography>
            </Box>
            
            {card.showProgress && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(card.progressValue, 100)} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: card.color
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};