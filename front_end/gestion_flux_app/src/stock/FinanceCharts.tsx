import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography, 
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from './formatters';
import { ChartData } from './types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FinanceChartsProps {
  inventoryValueData: ChartData[];
  categoryDistribution: { name: string; value: number }[];
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ 
  dateRange
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [chartView, setChartView] = useState<'value' | 'trend'>('value');
  
  const handleChartViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'value' | 'trend' | null,
  ) => {
    // Prevent null value
    if (newValue !== null) {
      setChartView(newValue);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 1.5, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider' 
          }}
        >
          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: entry.color,
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {entry.name}:
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                {formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const [analyticsData, setAnalyticsData] = useState({
    inventoryValueData: [] as ChartData[],
    categoryDistribution: [] as { name: string; value: number }[],
    loading: true,
    error: null as string | null
  });


  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
        setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await axios.get('http://localhost:4001/gestionFluxDB/stock/analytics', {
          params: {
            period: 'year', // ou 'day' selon le besoin
            startDate: dateRange.startDate?.toISOString(),
            endDate: dateRange.endDate?.toISOString()
          },
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('données',response);

        setAnalyticsData({
          inventoryValueData: response.data.data.inventoryValueData,
          categoryDistribution: response.data.data.categoryDistribution,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching inventory analytics", error);
        setAnalyticsData(prev => ({
          ...prev,
          loading: false,
          error: "Erreur lors du chargement des données"
        }));
      }
    };

    if (dateRange.startDate && dateRange.endDate) {
      fetchInventoryData();
    }
  }, [dateRange]);

  if (analyticsData.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (analyticsData.error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography color="error">{analyticsData.error}</Typography>
      </Box>
    );
  }


  return (
    <Grid container spacing={3}>
      {/* Chart Controls */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Évolution de la Valeur des Stocks
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={chartView}
            exclusive
            onChange={handleChartViewChange}
            aria-label="chart view"
          >
            <ToggleButton value="value" aria-label="value chart">
              Valeur
            </ToggleButton>
            <ToggleButton value="trend" aria-label="trend chart">
              Tendance
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Grid>
      
      {/* Inventory Value Chart */}
      <Grid item xs={12} md={8}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            height: 400,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'value' ? (
              <BarChart
                //data={inventoryValueData}
                data={analyticsData.inventoryValueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="achat" 
                  name="Valeur d'Achat" 
                  stackId="a" 
                  fill={theme.palette.primary.main} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="vente" 
                  name="Valeur de Vente" 
                  stackId="a" 
                  fill={theme.palette.success.main} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            ) : (
              <LineChart
              data={analyticsData.inventoryValueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="achat" 
                  name="Valeur d'Achat" 
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="vente" 
                  name="Valeur de Vente" 
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={2000}
                />
                <Line 
                  type="monotone" 
                  dataKey="marge" 
                  name="Marge Brute" 
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={2500}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Paper>
      </Grid>
      
      {/* Category Distribution Chart */}
      <Grid item xs={12} md={4}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            height: 400,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Répartition par Catégorie
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={analyticsData.categoryDistribution}
              //data={categoryDistribution}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.palette.divider }}
                axisLine={{ stroke: theme.palette.divider }}
                
              />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(value as number)}`, 'Valeur']}
                contentStyle={{ 
                  borderRadius: 4,
                  boxShadow: theme.shadows[2]
                }}
              />
              <Bar 
                dataKey="value" 
                fill={theme.palette.info.main}
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};