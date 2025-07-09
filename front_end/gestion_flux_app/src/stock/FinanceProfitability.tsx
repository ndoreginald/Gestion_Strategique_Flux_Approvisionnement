import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  CircularProgress
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from './formatters';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FinanceProfitabilityProps {
  data: any; // Using any for simplicity
}

export const FinanceProfitability: React.FC<FinanceProfitabilityProps> = ({ data }) => {
  const theme = useTheme();
  
  // All hooks must be declared at the top, unconditionally
  const [topProducts, setTopProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pieData, setPieData] = useState([
    { name: 'Marge élevée (>40%)', value: 0, color: theme.palette.success.main },
    { name: 'Marge moyenne (20-40%)', value: 0, color: theme.palette.info.main },
    { name: 'Marge faible (<20%)', value: 0, color: theme.palette.error.main },
  ]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
          if (!accessToken) {
            console.log("❌ Token manquant. Redirection...");
            navigate('/');
            return;
          }
        const response = await axios.get('http://localhost:4001/gestionFluxDB/stock/top-profitable-products', {
          params: {
            period: 'year', // ou 'month'
            limit: 5
          },
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.data?.success) {
          setTopProducts(response.data.data);
        }
      } catch (err) {
        console.error("Erreur:", err);
      }
    };
  
    fetchTopProducts();
  }, []);

  // Fetch categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:4001/gestionFluxDB/stock/margin-analysis-by-category', {
          params: { period: 'year' },
         headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.data?.success && response.data?.data) {
          setCategoriesData(response.data.data);
        } else {
          throw new Error('Format de données inattendu');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch pie chart data
  useEffect(() => {
    const fetchMarginData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:4001/gestionFluxDB/stock/margin-analysis', {
          params: { period: 'year' },
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const formattedData = response.data.data.pieData.map(item => ({
          name: item.name,
          value: item.value,
          color: item.color
        }));
        setPieData(formattedData);
      } catch (err) {
        console.error("Erreur:", err);
      }
    };
    fetchMarginData();
  }, []);

  // Helper functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 40) return { label: 'Élevée', color: 'success' };
    if (margin >= 20) return { label: 'Moyenne', color: 'primary' };
    return { label: 'Faible', color: 'error' };
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.primary">
            {payload[0].name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: payload[0].fill, borderRadius: '50%' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(payload[0].value)}
            </Typography>
          </Box>
        </Paper>
      );
    }
    return null;
  };

  // Conditional rendering - AFTER all hooks
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (categoriesData.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Aucune donnée disponible</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Profitability charts */}
      <Grid item xs={12} lg={4}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            height: 360,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Répartition de la Marge Brute
          </Typography>
          <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={theme.palette.background.paper}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {pieData.map((entry, index) => (
              <Box 
                key={`legend-${index}`} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5 
                }}
              >
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    bgcolor: entry.color,
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="caption">
                  {entry.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
      
      {/* Top 5 most profitable products */}
      <Grid item xs={12} lg={8}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            borderRadius: 2,
            height: 360
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Produits les Plus Rentables
          </Typography>
          
          <TableContainer sx={{ maxHeight: 290 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Produit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Revenu</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Coût</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Profit</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Marge</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {topProducts.map((product) => {
    const marginStatus = getMarginStatus(product.margin);
    
    return (
      <TableRow key={product.id} hover>
        <TableCell>{product.product}</TableCell>
        <TableCell>{product.category}</TableCell>
        <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
        <TableCell align="right">{formatCurrency(product.cost)}</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>
          {formatCurrency(product.profit)}
        </TableCell>
        <TableCell align="right">
          {formatPercentage(product.margin)}
        </TableCell>
        <TableCell align="center">
          <Chip 
            label={marginStatus.label} 
            color={marginStatus.color}
            size="small" 
            sx={{ minWidth: 80 }}
          />
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      
      {/* Category profitability */}
      <Grid item xs={12}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Rentabilité par Catégorie
          </Typography>
          
          <Grid container spacing={2}>
        {categoriesData.map((category, index) => {
          const marginStatus = getMarginStatus(category.margin);
      
      return (
        <Grid item xs={12} sm={6} md={4} lg={15/5} key={index}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.divider,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {category.category}
              </Typography>
              <Chip 
                label={marginStatus.label} 
                color={marginStatus.color}
                size="small"
              />
            </Box>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Revenu
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatCurrency(category.revenue)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Coût
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatCurrency(category.cost)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Profit
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(category.profit)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Marge
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatPercentage(category.margin)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
    <Typography variant="caption" color="text.secondary">
      Produits vendus
    </Typography>
    <Typography variant="body2">
      {category.quantitySold}
    </Typography>
  </Grid>
  <Grid item xs={6}>
    <Typography variant="caption" color="text.secondary">
      Types produits
    </Typography>
    <Typography variant="body2">
      {category.productsCount}
    </Typography>
  </Grid>
            </Grid>
          </Paper>
        </Grid>
      );
    })}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};
