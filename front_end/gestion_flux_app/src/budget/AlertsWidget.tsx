import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Button,
  useTheme
} from '@mui/material';
import { 
  WarningAmber as WarningIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { mockBudgetAlerts } from './mockData';

const AlertsWidget: React.FC = () => {
  const theme = useTheme();
  
  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'high') {
      return <ErrorIcon color="error" />;
    } else if (severity === 'medium') {
      return <WarningIcon color="warning" />;
    } else {
      return <InfoIcon color="info" />;
    }
  };
  
  const unreadAlerts = mockBudgetAlerts.filter(alert => !alert.read).length;
  
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Budget Alerts
          </Typography>
          <Badge badgeContent={unreadAlerts} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
            <Button size="small" variant="outlined">View All</Button>
          </Badge>
        </Box>
        
        <List sx={{ width: '100%' }}>
          {mockBudgetAlerts.slice(0, 4).map((alert, index) => (
            <React.Fragment key={alert.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start" 
                sx={{ 
                  py: 1.5,
                  opacity: alert.read ? 0.7 : 1,
                  backgroundColor: alert.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  {getAlertIcon(alert.type, alert.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: alert.read ? 400 : 600 }}>
                      {alert.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;