import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { Delete, Edit, Check, Close } from '@mui/icons-material';
import { Category } from './BudgetForm';
import { formatCurrency } from './formatters';

interface BudgetCategoriesListProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

const BudgetCategoriesList: React.FC<BudgetCategoriesListProps> = ({ 
  categories, 
  onUpdateCategories 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditAmount(category.allocatedAmount);
  };

  const handleSave = () => {
    if (editAmount <= 0) {
      setError("Le montant alloué doit être supérieur à zéro");
      return;
    }
    
    if (!editName.trim()) {
      setError("Le nom de la catégorie ne peut pas être vide");
      return;
    }

    setError(null);
    
    const updatedCategories = categories.map(category => {
      if (category.id === editingId) {
        // Calculate the remaining amount based on the new allocated amount
        const remainingAmount = editAmount - category.committedAmount;
        
        return {
          ...category,
          name: editName,
          allocatedAmount: editAmount,
          remainingAmount: remainingAmount
        };
      }
      return category;
    });
    
    onUpdateCategories(updatedCategories);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setError(null);
  };

  const handleDelete = (id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id);
    onUpdateCategories(updatedCategories);
  };

  if (categories.length === 0) {
    return (
      <Alert severity="info">
        Aucune catégorie budgétaire n'a été définie. Veuillez ajouter des catégories.
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell width="30%">
                <Typography variant="subtitle2">Catégorie</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">Montant Alloué</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">Montant Engagé</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">Montant Consommé</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2">Montant Restant</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2">Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>
                  {editingId === category.id ? (
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === category.id ? (
                    <TextField
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      type="number"
                      size="small"
                      fullWidth
                      variant="outlined"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  ) : (
                    formatCurrency(category.allocatedAmount)
                  )}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(category.committedAmount)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(category.consumedAmount)}
                </TableCell>
                <TableCell align="right" 
                  sx={{ 
                    color: category.remainingAmount < 0 
                      ? 'error.main' 
                      : category.remainingAmount < (category.allocatedAmount * 0.2) 
                        ? 'warning.main' 
                        : 'success.main' 
                  }}
                >
                  {formatCurrency(category.remainingAmount)}
                </TableCell>
                <TableCell align="center">
                  {editingId === category.id ? (
                    <Box>
                      <IconButton color="primary" onClick={handleSave} size="small">
                        <Check />
                      </IconButton>
                      <IconButton color="error" onClick={handleCancel} size="small">
                        <Close />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box>
                      <IconButton color="primary" onClick={() => handleEdit(category)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(category.id)} size="small">
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BudgetCategoriesList;