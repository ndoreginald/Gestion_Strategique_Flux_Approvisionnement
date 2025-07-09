import React from 'react';
import { 
  Grid, 
  TextField, 
  MenuItem,
  Box,
  Paper,
  InputAdornment,
  Button,
  Typography,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download, Filter, RefreshCcw, Search } from 'lucide-react';
import dayjs from 'dayjs';

interface FinanceHeaderProps {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    startDate: Date | null;
    endDate: Date | null;
  }>>;
  filterType: string;
  setFilterType: React.Dispatch<React.SetStateAction<string>>;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({ 
  dateRange, 
  setDateRange, 
  filterType, 
  setFilterType 
}) => {
  const theme = useTheme();

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setDateRange(prev => ({ ...prev, startDate: date.toDate() }));
    }
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setDateRange(prev => ({ ...prev, endDate: date.toDate() }));
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterType(event.target.value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Période"
              value={filterType}
              onChange={handleFilterChange}
              sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            >
              <MenuItem value="jour">Aujourd'hui</MenuItem>
              <MenuItem value="semaine">Cette semaine</MenuItem>
              <MenuItem value="mois">Ce mois</MenuItem>
              <MenuItem value="trimestre">Ce trimestre</MenuItem>
              <MenuItem value="annee">Cette année</MenuItem>
              <MenuItem value="personnalise">Période personnalisée</MenuItem>
            </TextField>
          </Grid>

          {filterType === "personnalise" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Date de début"
                  value={dateRange.startDate ? dayjs(dateRange.startDate) : null}
                  onChange={handleStartDateChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: "small",
                      sx: { bgcolor: 'background.paper', borderRadius: 1 }
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Date de fin"
                  value={dateRange.endDate ? dayjs(dateRange.endDate) : null}
                  onChange={handleEndDateChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: "small",
                      sx: { bgcolor: 'background.paper', borderRadius: 1 }
                    } 
                  }}
                />
              </Grid>
            </LocalizationProvider>
          )}

          <Grid item xs={12} md={filterType === "personnalise" ? 3 : 9}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <TextField
                placeholder="Rechercher..."
                size="small"
                sx={{ 
                  minWidth: { xs: '100%', md: 200 },
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshCcw size={18} />}
                size="small"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                startIcon={<Download size={18} />}
                size="small"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                Exporter
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};