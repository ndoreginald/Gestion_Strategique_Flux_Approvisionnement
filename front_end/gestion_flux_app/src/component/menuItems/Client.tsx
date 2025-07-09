import { useState, useEffect } from "react";
import { 
  Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, ThemeProvider, CssBaseline, createTheme, 
  TablePagination,
  IconButton,
  Typography,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../../layout/Sidebar";
import Header from "../../layout/Header";
import { ArrowDownNarrowWide, ArrowDownWideNarrow, DeleteIcon, EditIcon, LockOpenIcon } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';

interface ClientType {
  _id: string;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  statut: string;
  joinDate: string;
  activity: string;
  pays: string;
  ville: string;

}

function getStatusColor(status: string) {
  switch (status) {
    case 'Actif':
      return 'success';
    case 'Bloqué':
      return 'error';
    default:
      return 'default';
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const Client = () => {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof ClientType>("nom");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0); // ✅ Ajout de l'état de page
  const [rowsPerPage, setRowsPerPage] = useState(5); // ✅ Ajout de l'état pour le nombre de lignes par page

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("📡 Chargement des clients...");
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("❌ Token manquant. Redirection...");
      navigate('/');
      return;
    }

    fetch('http://localhost:4001/gestionFluxDB/client/', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => {
      if (response.status === 401) {
        navigate('/');
        return null;
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        console.log(" Données reçues :", data);
        setClients(data);
      }
    })
    .catch(error => console.error(' Erreur:', error));
  }, [location]);

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    client.adresse.toLowerCase().includes(search.toLowerCase()) ||
    client.telephone.includes(search)
  );

  const handleSort = (column: keyof ClientType) => {
    const isAsc = sortColumn === column && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortColumn(column);

    const sortedClients = [...clients].sort((a, b) => {
      const valueA = String(a[column]).toLowerCase();
      const valueB = String(b[column]).toLowerCase();
      
      if (valueA < valueB) return isAsc ? -1 : 1;
      if (valueA > valueB) return isAsc ? 1 : -1;
      return 0;
    });

    setClients(sortedClients);
  };

  // ✅ Appliquer la pagination
  const displayedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleBlock = async (id: string, nom: string) => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Token manquant. Veuillez vous reconnecter.");
      return;
    }

      const client = clients.find(c => c._id === id);
      if (!client) {
        console.error("Client introuvable");
        return;
      }

      const nouveauStatut = client.statut === 'Actif' ? 'Bloqué' : 'Actif';

      const response = await fetch(`http://localhost:4001/gestionFluxDB/client/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      if (response.ok) {
        setClients(clients.map(c => 
          c._id === id ? { ...c, statut: nouveauStatut } : c
        ));
      } else {
        console.error("Erreur lors du changement de statut :", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '10px' }}>
          <Header />
          <Paper sx={{ p: 3, mb: 4, border: "1px solid #ddd", boxShadow: 3 , mt:8}}>
  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
    <PersonIcon sx={{ color: "primary.main", fontSize: 28, mr: 1 }} />
    <Typography variant="h6" fontWeight="bold" color="primary">
      Liste des Clients
    </Typography>
  </Box>

  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    <TextField 
      label="Recherche un client..." 
      variant="outlined" 
      size="small" 
      sx={{ width: 250 }} 
      onChange={(e) => setSearch(e.target.value)} 
    />
    <Button variant="contained" color="primary" onClick={() => navigate(`/clients/add-client`)} startIcon={<AddIcon />}>
      Ajouter un client
    </Button>
  </Box>

  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#E3F2FD" }}> 
          {["nom", "adresse", "email", "telephone", "statut", "joinDate", "activity", "pays", "ville"].map((column) => (
            <TableCell key={column} sx={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSort(column as keyof ClientType)}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {column}
                {sortColumn === column && (
                  sortOrder === "asc" ? <ArrowDownNarrowWide size={16} style={{ marginLeft: 5 }} /> : <ArrowDownWideNarrow size={16} style={{ marginLeft: 5 }} />
                )}
              </Box>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {displayedClients.length > 0 ? (
          displayedClients.map((client) => (
            <TableRow key={client._id}>
              <TableCell>{client.nom}</TableCell>
              <TableCell>{client.adresse}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.telephone}</TableCell>
              <TableCell>
                <Chip 
                  label={client.statut}
                  color={getStatusColor(client.statut)}
                  size="small"
                  sx={{ 
                    fontWeight: 'bold',
                    minWidth: 100, // Largeur minimale pour uniformité
                }}/>
                </TableCell>
              <TableCell>{new Date(client.joinDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Box sx={{ width: 80, height: 8, backgroundColor: "#ddd", borderRadius: 4, position: "relative" }}>
                  <Box sx={{ width: `${client.activity}%`, height: "100%", backgroundColor: "blue", borderRadius: 4 }} />
                </Box>
              </TableCell>
              <TableCell>{client.pays}</TableCell>
              <TableCell>{client.ville}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => navigate(`/clients/clientEdit/${client._id}`)} aria-label="edit" disabled={client.statut === 'Bloqué'}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleBlock(client._id, client.nom)} aria-label="block">
                  {client.statut === 'Actif' ? <BlockIcon /> : <LockOpenIcon />}
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} align="center">Aucun client trouvé</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>

  <TablePagination
    component="div"
    count={filteredClients.length}
    page={page}
    onPageChange={(_, newPage) => setPage(newPage)}
    rowsPerPage={rowsPerPage}
    rowsPerPageOptions={[5, 10, 25, 50, 100]}
    onRowsPerPageChange={(e) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    }}
    labelRowsPerPage="Lignes par page"
  />
</Paper>

        </main>
      </div>
    </ThemeProvider>
  );
};

export default Client;
