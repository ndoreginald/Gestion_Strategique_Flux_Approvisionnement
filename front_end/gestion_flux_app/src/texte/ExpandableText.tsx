import { useState } from 'react';
import { Typography, Box, IconButton, Tooltip, createTheme } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

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
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
    },
    success: {
      main: "#059669",
      light: "#10b981",
      dark: "#047857",
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
          padding: '8px 16px',
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

function ExpandableText ({ text, maxLines = 3 }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!text) return <Typography variant="body2">N/A</Typography>;

  return (
    <Box>
      <Tooltip title={expanded ? "Réduire" : "Voir plus"}>
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: expanded ? 'unset' : maxLines,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
              color: theme.palette.primary.main
            }
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {text}
        </Typography>
      </Tooltip>
      {text.length > 100 && (
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          sx={{ p: 0, ml: 1 }}
        >
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      )}
    </Box>
  );
};
export default ExpandableText;