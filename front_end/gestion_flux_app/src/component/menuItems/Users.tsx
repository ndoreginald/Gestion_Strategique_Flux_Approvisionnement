//Afficher la liste des utilisateurs

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, TablePagination, Box, Button, Select, MenuItem, CardHeader, Avatar, Chip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { ArrowDownNarrowWide, ArrowDownWideNarrow, Menu } from 'lucide-react'; // Ajout des icônes
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import React from 'react';


const theme = createTheme({
palette: {
  mode: 'light',
  primary: { main: '#1976d2' },
  secondary: { main: '#dc004e' },
},
});

function getStatusColor(role: string) {
  switch (status) {
    case 'admin':
      return 'primary';
    case 'user':
      return 'secondary';
    default:
      return 'default';
  }
}

function Users() {
const location = useLocation();
const [users, setUsers] = useState<any[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const navigate = useNavigate();
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);
const [orderBy, setOrderBy] = useState<string>('nom'); // Colonne par défaut pour le tri
const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc'); // Direction du tri
const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

useEffect(() => {
  console.log("📡 Chargement des utilisateurs...");
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    console.log("❌ Token manquant. Veuillez vous reconnecter.");
    navigate('/'); 
    return;
  }

  fetch('http://localhost:4001/gestionFluxDB/users/', { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  })
  .then(response => {
    console.log("✅ Réponse API reçue :", response.status);
    if (response.status === 401) {
      navigate('/'); 
      return null;
    }
    return response.json();
  })
  .then(data => {
    if (data) {
      console.log(" Données reçues :", data);
      setUsers(data);
    }
  })
  .catch(error => console.error(' Erreur:', error));
}, [location]);


const handleDelete = async (id: string, nom: string) => {
  if (confirm(`Voulez-vous vraiment supprimer cet utilisateur "${nom}"?`)) {
      try {
          const accessToken = sessionStorage.getItem("accessToken");
          if (!accessToken) {
              alert("Token manquant. Veuillez vous reconnecter.");
              return;
          }

          const response = await fetch(`http://localhost:4001/gestionFluxDB/users/${id}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
              },
          });

          if (response.ok) {
              setUsers(users.filter(user => user._id !== id));
          } else {
              const errorData = await response.json();
              alert(`Erreur: ${errorData.error}`);
              console.error("Erreur lors de la suppression :", errorData.error);
          }
      } catch (error) {
          console.error("Erreur lors de la suppression :", error);
      }
  }
};


const handleSort = (column: string) => {
  const isAsc = orderBy === column && orderDirection === 'asc';
  setOrderBy(column);
  setOrderDirection(isAsc ? 'desc' : 'asc');
};

// Filtrer et trier les utilisateurs
const filteredUsers = Array.isArray(users) ? users.filter(user =>
  user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.telephone.includes(searchQuery)
) 
.sort((a, b) => {
  if (orderBy) {
    const valueA = a[orderBy]?.toString().toLowerCase();
    const valueB = b[orderBy]?.toString().toLowerCase();

    if (valueA < valueB) return orderDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return orderDirection === 'asc' ? 1 : -1;
  }
  return 0;
}) : [];


// Fonction pour modifier le rôle
const handleRoleChange = async (id: string, newRole: string) => {
  if (!confirm(`Changer le rôle de cet utilisateur en "${newRole}" ?`)) return;

  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    // Requête API pour modifier le rôle
    const response = await fetch(`http://localhost:4001/gestionFluxDB/users/${id}/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (response.ok) {
      setUsers(users.map(user => (user._id === id ? { ...user, role: newRole } : user)));
    } else {
      const errorData = await response.json();
      alert(`Erreur: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle :", error);
  }
};



  

return (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <div className="App" style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: '10px' }}>
        <Header />
        <br /><br />
        <Paper elevation={3} sx={{ p: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <PersonIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              Liste des Utilisateurs
            </Typography>
          }
          sx={{ pb: 0 }} 
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 2,
          }}
        >
          <TextField
            label="Rechercher..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", sm: 250 } }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {/* logique ajout utilisateur */}}
            sx={{ whiteSpace: "nowrap" }}
          >
            Ajouter un Utilisateur
          </Button>
        </Box>


          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {['nom', 'role', 'email', 'telephone'].map((column) => (
                    <TableCell
                      key={column}
                      sx={{ color: "black", fontWeight: "bold", cursor: "pointer" }}
                      align={column === 'nom' ? 'left' : 'right'}
                      onClick={() => handleSort(column)}
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                      {orderBy === column ? (
                        orderDirection === 'asc' ?
                          <ArrowDownNarrowWide size={16} style={{ marginLeft: 5 }} />
                          :
                          <ArrowDownWideNarrow size={16} style={{ marginLeft: 5 }} />
                      ) : null}
                    </TableCell>
                  ))}
                  <TableCell sx={{ color: "black", fontWeight: "bold" }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                  <TableRow
                    key={user._id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: index % 2 === 0 ? '#FFFBFB' : '#ffffff',
                      '&:hover': { backgroundColor: '#e0f7fa' },
                    }}
                  >
                    <TableCell>{user.nom}</TableCell>
                    <TableCell align="right">
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 100,
                        '& .MuiSelect-select': {
                          py: 0.5, // Réduit le padding vertical
                          color: '#ffffff',
                        },
                        //color: user.role === "admin" ? "primary.main" : "success.main",
                        bgcolor: user.role === "admin" ? "primary.light" : "success.light",
                        borderRadius: 40,
                      }}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </TableCell>
                    <TableCell align="right">{user.email}</TableCell>
                    <TableCell align="right">{user.telephone}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => navigate(`/users/userEdit/${user._id}`)} aria-label="edit" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user._id, user.nom)} aria-label="delete" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelRowsPerPage="Lignes par page"
          />
        </Paper>
      </main>
    </div>
  </ThemeProvider>
);
}

export default Users;
