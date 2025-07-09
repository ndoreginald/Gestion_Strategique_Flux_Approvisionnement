import { 
  Box, Button, Card, CardContent, CardMedia, Container, createTheme, CssBaseline,
  IconButton, Paper, TextField, ThemeProvider, Typography, CircularProgress, 
  Chip,Grid
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { Category as CategoryIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

interface Categorie {
  _id: string;
  nom: string;
  image: string;
  description?: string;
}

function Categorie() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Chargement des catégories...");
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("Token manquant. Redirection...");
      navigate('/');
      return;
    }
    fetch('http://localhost:4001/gestionFluxDB/categorie/', {
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
          setCategories(data);
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des données :', error))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, nom: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la catégorie "${nom}"?`)) {
      try {
        const response = await fetch(`http://localhost:4001/gestionFluxDB/categorie/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          setCategories(categories.filter(categorie => categorie._id !== id));
        } else {
          console.error("Erreur lors de la suppression :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const filteredCategories = categories.filter(categorie =>
    categorie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categorie.description && categorie.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "20px" }}>
          <Header />
          <Paper sx={{ p: 3, mb: 4, border: "1px solid #ddd", boxShadow: 3, mt:8 }}>
            {/* Titre */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CategoryIcon sx={{ color: "primary.main", fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                Liste des Catégories
              </Typography>
            </Box>

            {/* Barre de recherche et ajout */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Rechercher..." 
                  variant="outlined" 
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </Grid>
              <Grid item xs={12} sm={6} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate(`/categorie/add-categorie`)} 
                  startIcon={<AddIcon />}
                >
                  Ajouter catégorie
                </Button>
              </Grid>
            </Grid>

            {/* Affichage des catégories */}
            <Container maxWidth="xl" sx={{ mt: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : filteredCategories.length > 0 ? (
        <Grid container spacing={2} justifyContent="left">
          {filteredCategories.map((categorie) => (
            <Grid item xs={12} sm={6} md={3} key={categorie._id}>
              <Box p={2}>
                <Card 
                  sx={{
                    p: 3,
                    backgroundColor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: "all 0.3s ease",
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {/* Category Label */}
                  <Box 
                    sx={{ 
                      position: "relative", 
                      mb: 2,
                      textAlign: "left"
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        position: "absolute", 
                        top: 16, 
                        left: 16, 
                        backgroundColor: "background.paper", 
                        px: 2, 
                        py: 1, 
                        borderRadius: "16px", 
                        boxShadow: 1,
                        fontWeight: "bold" 
                      }}
                    >
                      categorie
                    </Typography>
                    <img 
                      src={categorie.image} 
                      alt={categorie.nom} 
                      style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }}
                    />
                  </Box>
                  {/* Category Name */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ fontFamily: "Poppins, sans-serif", color: "primary.dark" }}
                  >
                    {categorie.nom}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  mb={2} 
                  sx={{ fontStyle: "italic", fontFamily: "Georgia, serif", color: "gray" }}
                >
                  {categorie.description || 'Pas de description'}
                </Typography>

                   {/* Actions */}
                   <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'right', 
                          }}
                        >
                          <IconButton 
                            onClick={() => navigate(`/categories/Edit/${categorie._id}`)} 
                            color="primary"
                            sx={{ p: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(categorie._id, categorie.nom)} 
                            color="error"
                            sx={{ p: 1 }}
                          >
                            <Delete />
                          </IconButton>
                   </Box>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" textAlign="center" mt={4}>
          Aucune catégorie trouvée.
        </Typography>
      )}
    </Container>
          </Paper>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default Categorie;
