import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Tooltip,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import { TrendingUp, FileText, DollarSign, Users, Calendar, PieChart } from 'lucide-react';
import { QuoteStats as StatsType } from './Quote';

interface QuoteStatsProps {
  stats: StatsType;
}

const mockStats: StatsType = {
  totalQuotes: 42,
  totalAmount: 14890,
  averageAmount: 354.52,
  statusDistribution: {
    draft: 10,
    sent: 12,
    approved: 15,
    rejected: 3,
    expired: 2
  },
  monthlyTrend: [
    { month: 'Janvier', amount: 1200, count: 4 },
    { month: 'Février', amount: 1900, count: 5 },
    { month: 'Mars', amount: 2200, count: 6 },
    { month: 'Avril', amount: 1850, count: 5 },
    { month: 'Mai', amount: 1700, count: 4 },
    { month: 'Juin', amount: 1350, count: 3 },
    { month: 'Juillet', amount: 2100, count: 5 },
    { month: 'Août', amount: 290, count: 2 },
    { month: 'Septembre', amount: 800, count: 2 },
    { month: 'Octobre', amount: 500, count: 1 },
    { month: 'Novembre', amount: 0, count: 0 },
    { month: 'Décembre', amount: 500, count: 1 },
  ]
};


const QuoteStats: React.FC<QuoteStatsProps> = ({ stats }) => {
  const theme = useTheme();
   if (!stats) {
    return (
      <Typography variant="body1" color="text.secondary">
        Chargement des statistiques...
      </Typography>
    );
  }

  const StatCard = ({ icon, title, value, subtitle, trend, color }: any) => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box color={color}>{icon}</Box>
        </Box>
        {trend && (
          <Chip icon={<TrendingUp />} label={trend} color="success" size="small" />
        )}
      </Box>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Paper>
  );

  const StatusChart = () => {
    const total = Object.values(stats.statusDistribution).reduce((sum, count) => sum + count, 0);
    const statusLabels: Record<string, string> = {
      draft: 'Brouillons',
      sent: 'Envoyés',
      approved: 'Approuvés',
      rejected: 'Rejetés',
      expired: 'Expirés'
    };
    const statusColors: Record<string, string> = {
      draft: theme.palette.grey[500],
      sent: theme.palette.info.main,
      approved: theme.palette.success.main,
      rejected: theme.palette.error.main,
      expired: theme.palette.warning.main
    };

    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <PieChart style={{ marginRight: 8 }} />
          <Typography variant="h6">Répartition par statut</Typography>
        </Box>
        <Stack spacing={2}>
          {Object.entries(stats.statusDistribution).map(([status, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <Box key={status} display="flex" alignItems="center" justifyContent="space-between">
                <Typography flex={1}>{statusLabels[status]}</Typography>
                <Box width={120} mr={2}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ height: 8, borderRadius: 5, backgroundColor: '#f0f0f0', '& .MuiLinearProgress-bar': { backgroundColor: statusColors[status] } }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold">{count}</Typography>
              </Box>
            );
          })}
        </Stack>
      </Paper>
    );
  };

  const TrendChart = () => {
    const maxAmount = Math.max(...stats.monthlyTrend.map(item => item.amount));

    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Calendar style={{ marginRight: 8 }} />
          <Typography variant="h6">Évolution mensuelle</Typography>
        </Box>
        <Stack spacing={2}>
          {stats.monthlyTrend.map((item, index) => {
            const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            return (
              <Box key={index}>
                <Typography variant="body2" gutterBottom>{item.month}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ height: 10, borderRadius: 5, backgroundColor: '#e0e0e0' }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">{item.count} devis</Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Tableau de bord</Typography>
        <Typography variant="body2" color="text.secondary">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<FileText />} title="Total des devis" value={stats.totalQuotes}
            subtitle="Tous statuts confondus" trend="+12%" color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<DollarSign />} title="Chiffre d'affaires"
            value={stats.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            subtitle="Montant total des devis" trend="+8%" color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<TrendingUp />} title="Montant moyen"
            value={stats.averageAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            subtitle="Par devis" trend="+5%" color={theme.palette.secondary.main} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<Users />} title="Taux d'approbation"
            value={`${Math.round((stats.statusDistribution.approved / stats.totalQuotes) * 100)}%`}
            subtitle={`${stats.statusDistribution.approved} devis approuvés`} trend="+3%" color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <StatusChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TrendChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuoteStats;
