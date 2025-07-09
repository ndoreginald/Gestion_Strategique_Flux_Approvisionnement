import { useState } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';

type ActivityViewMode = 'bar' | 'percentage' | 'status';

function ActivityIndicator ({ value }: { value: number }){
  const [viewMode, setViewMode] = useState<ActivityViewMode>('bar');

  const getStatus = () => {
    if (value >= 80) return { color: '#4CAF50', label: 'Très actif' };
    if (value >= 50) return { color: '#2196F3', label: 'Actif' };
    if (value > 0) return { color: '#FF9800', label: 'Peu actif' };
    return { color: '#F44336', label: 'Inactif' };
  };

  const renderView = () => {
    switch(viewMode) {
      case 'bar':
        return (
          <Box sx={{ width: 80, height: 8, backgroundColor: "#ddd", borderRadius: 4 }}>
            <Box 
              sx={{ 
                width: `${value}%`, 
                height: "100%", 
                backgroundColor: getStatus().color, 
                borderRadius: 4 
              }} 
            />
          </Box>
        );
      case 'percentage':
        return <Box sx={{ fontWeight: 'bold' }}>{value}%</Box>;
      case 'status':
        return (
          <Chip 
            label={getStatus().label}
            size="small"
            sx={{ 
              backgroundColor: getStatus().color,
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Tooltip title="Cliquez pour changer la vue">
      <Box 
        sx={{ 
          display: 'inline-block',
          cursor: 'pointer',
          minWidth: 80,
          textAlign: 'center'
        }}
        onClick={() => setViewMode(
          viewMode === 'bar' ? 'percentage' : 
          viewMode === 'percentage' ? 'status' : 'bar'
        )}
      >
        {renderView()}
      </Box>
    </Tooltip>
  );
};
export default ActivityIndicator;