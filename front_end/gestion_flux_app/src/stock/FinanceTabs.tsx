import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography,
  useTheme
} from '@mui/material';
import { BarChart2, LineChart, Table as TableIcon, PieChart } from 'lucide-react';
//import { FinanceTransactionsTable } from './FinanceTransactionsTable';
import { FinanceCharts } from './FinanceCharts';
import { FinanceProfitability } from './FinanceProfitability';
import { FinanceBudgetAnalysis } from './FinanceBudgetAnalysis';
import { FinanceTransactionsTable } from './FinanceTransactionsTable';
import { ChartData, Transaction } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `finance-tab-${index}`,
    'aria-controls': `finance-tabpanel-${index}`,
  };
}

interface FinanceTabsProps {
  transactions: Transaction[];
  inventoryValueData: ChartData[];
  profitabilityData: any; // Using any for simplicity
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export const FinanceTabs: React.FC<FinanceTabsProps> = ({ 
  transactions,
  inventoryValueData,
  profitabilityData,
  dateRange
}) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 1
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="finance tabs"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }
          }}
        >
          <Tab 
            icon={<BarChart2 size={20} />} 
            label="Analyse Financière" 
            iconPosition="start"
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<TableIcon size={20} />} 
            label="Transactions" 
            iconPosition="start"
            {...a11yProps(1)} 
          />
          <Tab 
            icon={<PieChart size={20} />} 
            label="Profitabilité" 
            iconPosition="start"
            {...a11yProps(2)} 
          />
          <Tab 
            icon={<LineChart size={20} />} 
            label="Budget vs Réel" 
            iconPosition="start"
            {...a11yProps(3)} 
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <FinanceCharts 
          inventoryValueData={inventoryValueData} 
          //categoryDistribution={categoryDistribution}
          dateRange={dateRange}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <FinanceTransactionsTable transactions={transactions} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <FinanceProfitability data={profitabilityData} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <FinanceBudgetAnalysis />
      </TabPanel>
    </Box>
  );
};