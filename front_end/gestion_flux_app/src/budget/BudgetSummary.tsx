import React, { useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Divider, 
  LinearProgress,
  Card,
  CardContent 
} from '@mui/material';
import { Category } from './BudgetForm';
import { PieChart } from '@mui/x-charts/PieChart';
import { formatCurrency } from './formatters';

interface BudgetSummaryProps {
  categories: Category[];
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ categories }) => {
  const summaryData = useMemo(() => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    const totalCommitted = categories.reduce((sum, cat) => sum + cat.committedAmount, 0);
    const totalConsumed = categories.reduce((sum, cat) => sum + cat.consumedAmount, 0);
    const totalRemaining = totalAllocated - totalCommitted;
    
    const consumptionRate = totalAllocated > 0 ? (totalConsumed / totalAllocated) * 100 : 0;
    const commitmentRate = totalAllocated > 0 ? (totalCommitted / totalAllocated) * 100 : 0;
    
    return {
      totalAllocated,
      totalCommitted,
      totalConsumed,
      totalRemaining,
      consumptionRate,
      commitmentRate,
    };
  }, [categories]);

  const chartData = useMemo(() => {
    return categories.map(category => ({
      id: category.id,
      value: category.allocatedAmount,
      label: category.name,
    }));
  }, [categories]);

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Résumé Financier
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Budget Total
                </Typography>
                <Typography variant="h5" fontWeight="500">
                  {formatCurrency(summaryData.totalAllocated)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Budget Restant
                </Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="500"
                  color={summaryData.totalRemaining < 0 ? 'error.main' : 'success.main'}
                >
                  {formatCurrency(summaryData.totalRemaining)}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Taux d'Engagement</Typography>
                <Typography variant="body2" fontWeight="500">
                  {summaryData.commitmentRate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(summaryData.commitmentRate, 100)} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: summaryData.commitmentRate > 90 
                      ? 'warning.main' 
                      : 'primary.main',
                  }
                }}
              />
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Taux de Consommation</Typography>
                <Typography variant="body2" fontWeight="500">
                  {summaryData.consumptionRate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(summaryData.consumptionRate, 100)} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: summaryData.consumptionRate > 90 
                      ? 'error.main' 
                      : 'info.main',
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition du Budget
              </Typography>
              
              <Box sx={{ height: 250, width: '100%', mt: 2 }}>
                {categories.length > 0 && summaryData.totalAllocated > 0 ? (
                  <PieChart
                    series={[
                      {
                        data: chartData,
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        arcLabel: (item) => 
                          `${((item.value / summaryData.totalAllocated) * 100).toFixed(1)}%`,
                        arcLabelMinAngle: 20,
                      },
                    ]}
                    height={250}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Ajoutez des catégories pour voir la répartition
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetSummary;