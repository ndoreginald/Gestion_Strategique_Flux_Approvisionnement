import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Typography,
  Grid,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Paper
} from '@mui/material';
import { Package } from 'lucide-react';
import { FinanceHeader } from './FinanceHeader';
import { FinanceSummary } from './FinanceSummary';
import { FinanceTabs } from './FinanceTabs';
import { mockInventoryValue, mockProfitability, mockTransactions } from './mockData';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
//import { mockTransactions, mockInventoryValue, mockProfitability } from '../../utils/mockData';

export const StockFinanceDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [filterType, setFilterType] = useState<string>('mois');
  
  // Mock data statistics
  const totalInventoryValue = 287450.75;
  const totalPurchaseValue = 42350.25;
  const totalSalesValue = 68750.50;
  const grossProfit = totalSalesValue - totalPurchaseValue;
  

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
          padding: '12px 24px',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

  return (
    <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <Header />
              
                {/* Titre */}
            <Container maxWidth="xl" sx={{mt:8}}>
                <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Package size={32} color="#1976d2" />
                        <Typography variant="h4" color="primary" sx={{ ml: 1, fontWeight: 600 }}>
                            Gestion Financière des Stocks
                        </Typography>
                        </Box>
                        
                        <FinanceHeader 
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        />
                        
                        <FinanceSummary 
                        totalInventoryValue={totalInventoryValue}
                        totalPurchaseValue={totalPurchaseValue}
                        totalSalesValue={totalSalesValue}
                        grossProfit={grossProfit}
                        />
                        
                        <Box sx={{ mt: 4 }}>
                        <FinanceTabs 
                            transactions={mockTransactions}
                            inventoryValueData={mockInventoryValue}
                            profitabilityData={mockProfitability}
                            dateRange={dateRange}
                        />
                        </Box>
                    </CardContent>
                </Card>
            </Container>
            </Box>
          </Box>
        </ThemeProvider>
  );
};