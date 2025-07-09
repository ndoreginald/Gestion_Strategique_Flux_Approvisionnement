import React from 'react';
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
  LinearProgress,
  useTheme 
} from '@mui/material';
import { mockSuppliers } from './mockData';

const TopSuppliers: React.FC = () => {
  const theme = useTheme();
  
  const formatCurrency = (value: number) => {
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
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Top Suppliers
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Budget Allocation</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSuppliers.map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {supplier.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {supplier.contactPerson}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(supplier.totalBudgetAllocated)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {formatCurrency(supplier.totalBudgetSpent)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({((supplier.totalBudgetSpent / supplier.totalBudgetAllocated) * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={supplier.performance} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 
                                supplier.performance > 90 ? theme.palette.success.main :
                                supplier.performance > 75 ? theme.palette.info.main :
                                supplier.performance > 60 ? theme.palette.warning.main :
                                theme.palette.error.main
                            }
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.performance}/100
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TopSuppliers;