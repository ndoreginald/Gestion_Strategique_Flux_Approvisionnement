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
import { ArrowDownNarrowWide, ArrowDownWideNarrow, EditIcon, LockOpenIcon } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';
import BusinessIcon from '@mui/icons-material/Business';
import ActivityIndicator from "../../texte/ActivityIndicator";
import axios from "axios";
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

interface fournisseurType {
  _id: string;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  statut: string;
  joinDate: string;
  activity: string
  pays: string
  ville: string
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

const Fournisseurs = () => {
  const [fournisseurs, setfournisseurs] = useState<fournisseurType[]>([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof fournisseurType>("nom");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0); // ✅ Ajout de l'état de page
  const [rowsPerPage, setRowsPerPage] = useState(5); // ✅ Ajout de l'état pour le nombre de lignes par page

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("📡 Chargement des fournisseurs...");
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("❌ Token manquant. Redirection...");
      navigate('/');
      return;
    }

    fetch('http://localhost:4001/gestionFluxDB/fournisseur/', {
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
        setfournisseurs(data);
      }
    })
    .catch(error => console.error(' Erreur:', error));
  }, [location]);

  const filteredfournisseurs = fournisseurs.filter(fournisseur =>
    fournisseur.nom.toLowerCase().includes(search.toLowerCase()) ||
    fournisseur.email.toLowerCase().includes(search.toLowerCase()) ||
    fournisseur.adresse.toLowerCase().includes(search.toLowerCase()) ||
    fournisseur.telephone.includes(search)
  );

  const handleSort = (column: keyof fournisseurType) => {
    const isAsc = sortColumn === column && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortColumn(column);

    const sortedfournisseurs = [...fournisseurs].sort((a, b) => {
      const valueA = String(a[column]).toLowerCase();
      const valueB = String(b[column]).toLowerCase();
      
      if (valueA < valueB) return isAsc ? -1 : 1;
      if (valueA > valueB) return isAsc ? 1 : -1;
      return 0;
    });

    setfournisseurs(sortedfournisseurs);
  };

  // ✅ Appliquer la pagination
  const displayedfournisseurs = filteredfournisseurs.slice(
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

      const fournisseur = fournisseurs.find(c => c._id === id);
      if (!fournisseur) {
        console.error("fournisseur introuvable");
        return;
      }

      const nouveauStatut = fournisseur.statut === 'Actif' ? 'Bloqué' : 'Actif';

      const response = await fetch(`http://localhost:4001/gestionFluxDB/fournisseur/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      if (response.ok) {
        setfournisseurs(fournisseurs.map(c => 
          c._id === id ? { ...c, statut: nouveauStatut } : c
        ));
      } else {
        console.error("Erreur lors du changement de statut :", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

  const updateActivity = async (fournisseurId: string) => {
    try {
      const response = await axios.put(`http://localhost:4001/gestionFluxDB/fournisseur/update-activity/${fournisseurId}`);
      console.log(response.data.message);
    } catch (error) {
      console.error("Erreur de mise à jour de l'activité :", error);
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
    <BusinessIcon sx={{ color: "success.main", fontSize: 28, mr: 1 }} />
    <Typography variant="h6" fontWeight="bold" color="success">
      Liste des Fournisseurs
    </Typography>
  </Box>

  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    <TextField 
      label="Recherche un fournisseur..." 
      variant="outlined" 
      size="small" 
      sx={{ width: 250 }} 
      onChange={(e) => setSearch(e.target.value)} 
    />
    <Button variant="contained" color="success" onClick={() => navigate(`/fournisseurs/add-fournisseur`)} startIcon={<AddIcon />}>
      Ajouter un fournisseur
    </Button>
  </Box>

  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: "#E8F5E9" }}> 
          {["nom", "adresse", "email", "telephone", "statut", "joinDate", "activity", "pays", "ville"].map((column) => (
            <TableCell key={column} sx={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSort(column as keyof fournisseurType)}>
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
        {displayedfournisseurs.length > 0 ? (
          displayedfournisseurs.map((fournisseur) => (
            <TableRow key={fournisseur._id}>
              <TableCell>{fournisseur.nom}</TableCell>
              <TableCell>{fournisseur.adresse}</TableCell>
              <TableCell>{fournisseur.email}</TableCell>
              <TableCell>{fournisseur.telephone}</TableCell>
              <TableCell>
                <Chip 
                    label={fournisseur.statut}
                    color={getStatusColor(fournisseur.statut)}
                    size="small"
                    sx={{ 
                      fontWeight: 'bold',
                      minWidth: 100, // Largeur minimale pour uniformité
                      }}/>
              </TableCell>
              <TableCell>{new Date(fournisseur.joinDate).toLocaleDateString()}</TableCell>
              <TableCell>
              <ActivityIndicator value={fournisseur.activity} />
              </TableCell>
              <TableCell>{fournisseur.pays}</TableCell>
              <TableCell>{fournisseur.ville}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => updateActivity(fournisseur._id)} aria-label="edit" disabled={fournisseur.statut === 'Bloqué'}>
                    <ChangeCircleIcon />
                  </IconButton>

                <IconButton onClick={() => navigate(`/fournisseurs/fournisseurEdit/${fournisseur._id}`)} aria-label="edit" disabled={fournisseur.statut === 'Bloqué'}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleBlock(fournisseur._id, fournisseur.nom)} aria-label="block">
                  {fournisseur.statut === 'Actif' ? <BlockIcon /> : <LockOpenIcon />}
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} align="center">Aucun fournisseur trouvé</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

        </main>
      </div>
    </ThemeProvider>
  );
};


export default Fournisseurs;
