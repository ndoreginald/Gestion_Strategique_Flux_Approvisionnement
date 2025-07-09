import { Box, Container, createTheme, CssBaseline, Grid, Paper, ThemeProvider } from "@mui/material";
import Sidebar from "../../layout/Sidebar";
import Header from "../../layout/Header";
import SpendingTrendChart from "../../budget/SpendingTrendChart";
import BudgetCategoryChart from "../../budget/BudgetCategoryChart";
import RecentBudgets from "../../budget/RecentBudgets";
import TopSuppliers from "../../budget/TopSuppliers";
import AlertsWidget from "../../budget/AlertsWidget";
import BudgetOverview from "../../budget/BudgetOverview";
import { Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";



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

function Budget () {

  const navigate = useNavigate();

    return (
      
      <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
              <Sidebar />
              <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                <Header />
                
                  {/* Titre */}
                  <Container maxWidth="xl" sx={{mt:8}}>
                    <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3
                    }}
                  >
                    <Typography variant="h4" color="text.primary">
                      Budgets
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate(`/budget/form`)
                      }
                    >
                      Créer un budget
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Budget Overview */}
                    <Grid item xs={12} lg={8}>
                        <BudgetOverview />
                    </Grid>
                    
                    {/* Alerts Widget */}
                    <Grid item xs={12} lg={4}>
                        <AlertsWidget />
                    </Grid>
                    
                    {/* Spending Trend Chart */}
                    <Grid item xs={12} md={8}>
                        <SpendingTrendChart />
                    </Grid>
                    
                    {/* Budget Category Chart */}
                    <Grid item xs={12} md={4}>
                        <BudgetCategoryChart />
                    </Grid>
                    
                    {/* Recent Budgets */}
                    <Grid item xs={12} lg={8}>
                        <RecentBudgets />
                    </Grid>
                    
                    {/* Top Suppliers */}
                    <Grid item xs={12} lg={4}>
                        <TopSuppliers />
                    </Grid>
                    </Grid>
                  </Container>
            
        </Box>
      </Box>
    </ThemeProvider>
    )
  }


export default Budget
