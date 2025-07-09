import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography,
  Stack,
  Tab,
  Tabs,
  useTheme,
  alpha
} from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency, formatPercentage } from './formatters';

// Mock data for budget vs actual analysis
const budgetData = [
  { month: 'Jan', budget: 50000, actual: 48000, variance: -2000, varPercent: -4 },
  { month: 'Fév', budget: 55000, actual: 52000, variance: -3000, varPercent: -5.5 },
  { month: 'Mar', budget: 60000, actual: 62000, variance: 2000, varPercent: 3.3 },
  { month: 'Avr', budget: 58000, actual: 59500, variance: 1500, varPercent: 2.6 },
  { month: 'Mai', budget: 62000, actual: 65000, variance: 3000, varPercent: 4.8 },
  { month: 'Juin', budget: 65000, actual: 63000, variance: -2000, varPercent: -3.1 },
  { month: 'Juil', budget: 70000, actual: 73000, variance: 3000, varPercent: 4.3 },
  { month: 'Août', budget: 72000, actual: 68000, variance: -4000, varPercent: -5.6 },
  { month: 'Sep', budget: 68000, actual: 70000, variance: 2000, varPercent: 2.9 },
  { month: 'Oct', budget: 75000, actual: 72000, variance: -3000, varPercent: -4 },
  { month: 'Nov', budget: 80000, actual: 85000, variance: 5000, varPercent: 6.3 },
  { month: 'Déc', budget: 85000, actual: 88000, variance: 3000, varPercent: 3.5 },
];

export const FinanceBudgetAnalysis: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Calculate totals
  const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = budgetData.reduce((sum, item) => sum + item.actual, 0);
  const totalVariance = totalActual - totalBudget;
  const totalVariancePercent = (totalVariance / totalBudget) * 100;
  
  // Filter by quarter based on tab
  const getQuarterData = (quarter: number) => {
    const start = quarter * 3;
    return budgetData.slice(start, start + 3);
  };
  
  const currentData = tabValue === 0 ? budgetData : getQuarterData(tabValue - 1);
  
  // Custom tooltip
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
          {payload[0] && payload[1] && (
            <Box sx={{ mt: 0.5, pt: 0.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Variance:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: payload[1].value - payload[0].value >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {formatCurrency(payload[1].value - payload[0].value)}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Budget Total Annuel
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(totalBudget)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Réalisé Total Annuel
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(totalActual)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Variance Totale
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: totalVariance >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {formatCurrency(totalVariance)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                % Variance
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: totalVariancePercent >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {formatPercentage(totalVariancePercent)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Budget vs Actual Chart */}
      <Grid item xs={12}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            borderRadius: 2
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 100
                }
              }}
            >
              <Tab label="Année complète" />
              <Tab label="Q1 (Jan-Mar)" />
              <Tab label="Q2 (Avr-Juin)" />
              <Tab label="Q3 (Juil-Sep)" />
              <Tab label="Q4 (Oct-Déc)" />
            </Tabs>
          </Box>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={currentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="month"
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
                  dataKey="budget" 
                  name="Budget" 
                  fill={alpha(theme.palette.primary.main, 0.7)}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1200}
                />
                <Bar 
                  dataKey="actual" 
                  name="Réalisé" 
                  fill={alpha(theme.palette.success.main, 0.7)} 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="variance" 
                  name="Variance" 
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  animationDuration={2000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      
      {/* Variance Table */}
      <Grid item xs={12}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Analyse Détaillée des Écarts
          </Typography>
          
          <Box sx={{ overflowX: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, px: 2 }}>
              <Typography variant="subtitle2" sx={{ width: 80, flexShrink: 0 }}>Mois</Typography>
              <Typography variant="subtitle2" sx={{ width: 120, flexShrink: 0, textAlign: 'right' }}>Budget</Typography>
              <Typography variant="subtitle2" sx={{ width: 120, flexShrink: 0, textAlign: 'right' }}>Réalisé</Typography>
              <Typography variant="subtitle2" sx={{ width: 120, flexShrink: 0, textAlign: 'right' }}>Variance</Typography>
              <Typography variant="subtitle2" sx={{ width: 120, flexShrink: 0, textAlign: 'right' }}>% Variance</Typography>
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Performance</Typography>
            </Stack>
            
            {currentData.map((item, index) => (
              <Stack 
                key={index}
                direction="row" 
                spacing={1} 
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderTop: index > 0 ? `1px solid ${theme.palette.divider}` : 'none'
                }}
              >
                <Typography sx={{ width: 80, flexShrink: 0, fontWeight: 500 }}>{item.month}</Typography>
                <Typography sx={{ width: 120, flexShrink: 0, textAlign: 'right' }}>{formatCurrency(item.budget)}</Typography>
                <Typography sx={{ width: 120, flexShrink: 0, textAlign: 'right' }}>{formatCurrency(item.actual)}</Typography>
                <Typography 
                  sx={{ 
                    width: 120, 
                    flexShrink: 0, 
                    textAlign: 'right',
                    color: item.variance >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 500
                  }}
                >
                  {formatCurrency(item.variance)}
                </Typography>
                <Typography 
                  sx={{ 
                    width: 120, 
                    flexShrink: 0, 
                    textAlign: 'right',
                    color: item.varPercent >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 500
                  }}
                >
                  {formatPercentage(item.varPercent)}
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: alpha(theme.palette.grey[300], 0.5),
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: '100%', 
                        width: `${Math.min(Math.abs(item.varPercent) * 5, 100)}%`,
                        bgcolor: item.varPercent >= 0 ? 'success.main' : 'error.main',
                        borderRadius: 4
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};