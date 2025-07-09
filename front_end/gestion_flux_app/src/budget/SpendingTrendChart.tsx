import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Box, useTheme, FormControl, InputLabel, Select, MenuItem,
  TextField
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler, Legend
);

const SpendingTrendChart: React.FC = () => {
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
           if (!accessToken) {
                console.error("Token manquant. Veuillez vous reconnecter.");
                return;
            }
        const res = await axios.get(`http://localhost:4001/gestionFluxDB/budget/monthly-spending/${year}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setChartData(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
      }
    };

    fetchData();
  }, [year]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newYear = Number(e.target.value);
      if (newYear >= 2000 && newYear <= 2100) {
        setYear(newYear);
      }
    };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        ticks: {
          callback: (value: any) => `$${value / 1000}k`
        },
        grid: {
          borderDash: [5, 5]
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 0.8,
        to: 0.2,
        loop: true
      }
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Monthly Spending Trends ({year})
          </Typography>
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
        </Box>

        <Box sx={{ height: 300, position: 'relative', mt: 2 }}>
          {chartData ? (
            <Line data={chartData} options={options} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chargement des données...
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SpendingTrendChart;
