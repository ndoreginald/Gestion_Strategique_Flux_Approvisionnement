import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetCategoryChart: React.FC = () => {
  const theme = useTheme();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
           if (!accessToken) {
                console.error("Token manquant. Veuillez vous reconnecter.");
                return;
              }
        const response = await axios.get('http://localhost:4001/gestionFluxDB/budget/category-budget', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const categories = response.data;

        const labels = categories.map((item: any) => item.categorieName);
        const data = categories.map((item: any) => item.totalAllocated);

        const backgroundColors = [
          '#4caf50', '#2196f3', '#ff9800', '#e91e63',
          '#9c27b0', '#3f51b5', '#00bcd4', '#8bc34a'
        ];

        setChartData({
          labels,
          datasets: [
            {
              label: 'Budget par catégorie',
              data,
              backgroundColor: backgroundColors.slice(0, labels.length),
              borderWidth: 1
            }
          ]
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(value)}`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
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
          Budget Allocation by Category
        </Typography>

        <Box sx={{ height: 300, position: 'relative', mt: 2 }}>
          {chartData ? (
            <Pie data={chartData} options={options} />
          ) : (
            <Typography variant="body2">Chargement...</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetCategoryChart;
