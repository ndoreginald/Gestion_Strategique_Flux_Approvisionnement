import { ThemeProvider } from '@emotion/react';
import { Box, Button, Chip, Container, createTheme, CssBaseline, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { Component, useEffect, useState } from 'react'
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from "@mui/icons-material/Add";
import ExpandableText from '../../texte/ExpandableText';



const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

function getStatusColor(statut: string) {
  switch (statut) {
    case 'actif':
      return 'success';
    case 'inactif':
      return 'error';
    default:
      return 'default';
  }
}

function Produit () {

  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
    fetch('http://localhost:4001/gestionFluxDB/produit/',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      .then(response => response.json())
      .then(data => {
        if (data) {
          setProduits(data);
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des données :', error));
  }, []);

  const handleBlock = async (id, label) => {
    try {
      const produit = produits.find(p => p._id === id);
      if (!produit) {
        console.error("Produit introuvable");
        return;
      }

      const nouveauStatut = produit.statut === 'actif' ? 'inactif' : 'actif';

      const response = await fetch(`http://localhost:4001/gestionFluxDB/produit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      if (response.ok) {
        setProduits(produits.map(p => 
          p._id === id ? { ...p, statut: nouveauStatut } : p
        ));
      } else {
        console.error("Erreur lors du changement de statut :", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

 // Filtrer les produits en fonction de la recherche
const produitsFiltres = produits.filter(produit => 
  produit.label.toLowerCase().includes(searchTerm.toLowerCase())
);

// Regrouper les produits filtrés par catégorie
const produitsParCategorie = produitsFiltres.reduce((acc, produit) => {
  const categorie = produit.categorie_id && produit.categorie_id.nom ? produit.categorie_id.nom : 'Autres';
  if (!acc[categorie]) {
    acc[categorie] = [];
  }
  acc[categorie].push(produit);
  return acc;
}, {});

// Trier les catégories par ordre alphabétique
const categoriesTriees = Object.keys(produitsParCategorie).sort();

    return (
        <>
          <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <div className="App" style={{ display: "flex" }}>
                          <Sidebar />
                          <main style={{ flexGrow: 1, padding: "20px" }}>
                            <Header />
                            <Paper sx={{ p: 3, mb: 4, border: "1px solid #ddd", boxShadow: 3 , mt:8}}>

                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <ListAltIcon sx={{ color: "primary.main", fontSize: 28, mr: 1 }} />
                              <Typography variant="h6" fontWeight="bold" color="primary">
                                Liste des Produits
                              </Typography>
                            </Box>
                          
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                              <TextField 
                                label="Rechercher..." 
                                variant="outlined" 
                                size="small" 
                                sx={{ width: 250 }} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                value={searchTerm}
                              />
                              <Button variant="contained" color="primary" onClick={() => navigate(`/produit/add-produit`)} startIcon={<AddIcon />}>
                                Ajouter un Produit
                              </Button>
                            </Box>
          
                                <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'blue' }}>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>Label</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="center">Description</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Prix Vente&nbsp;(€)</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Prix Achat&nbsp;(€)</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Code Barre&nbsp;</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Date Création&nbsp;</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Statut&nbsp;</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Catégorie&nbsp;</TableCell>
                                      <TableCell sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }} align="right">Action&nbsp;</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {categoriesTriees.map(categorie => (
                                      <React.Fragment key={categorie}>
                                        <TableRow sx={{ backgroundColor: 'lightgray' }}>
                                          <TableCell colSpan={10} sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {categorie}
                                          </TableCell>
                                        </TableRow>
                                        {produitsParCategorie[categorie]
                                          .sort((a, b) => a.label.localeCompare(b.label))
                                          .map(produit => (
                                            <TableRow 
                                              key={produit._id} 
                                              sx={{ 
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '&:hover': {
                                                  backgroundColor: '#e0f7fa'  // Couleur de survol modifiée
                                                }
                                              }}
                                            >
                                              <TableCell component="th" scope="row" style={{ width: '120px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90px' }}>
                                                  <img src={produit.image} alt={produit.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </div>
                                              </TableCell>
                                              <TableCell align="right">{produit.label}</TableCell>
                                              <TableCell align="left"><ExpandableText text={produit.description} maxLines={3} /></TableCell>
                                              <TableCell align="right">{produit.prix_vente.toFixed(2)}</TableCell>
                                              <TableCell align="right">{produit.prix_achat.toFixed(2)}</TableCell>
                                              <TableCell align="right">{produit.code_barre}</TableCell>
                                              <TableCell align="right">{new Date(produit.date_creation).toLocaleDateString()}</TableCell>
                                              <TableCell align="right" >
                                                <Chip 
                                                  label={produit.statut}
                                                  color={getStatusColor(produit.statut)}
                                                  size="small"
                                                    sx={{ 
                                                      fontWeight: 'bold',
                                                      minWidth: 100, // Largeur minimale pour uniformité
                                                      }}/>
                                                  </TableCell>
                                              <TableCell align="right">{produit.categorie_id ? produit.categorie_id.nom : 'N/A'}</TableCell>
                                              <TableCell align="right">
                                                <IconButton 
                                                  onClick={() => navigate(`/products/Edit/${produit._id}`)} 
                                                  aria-label="edit" 
                                                  disabled={produit.statut === 'Inactif'}
                                                >
                                                  <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                  onClick={() => handleBlock(produit._id, produit.label)} 
                                                  aria-label="block"
                                                >
                                                  {produit.statut === 'Actif' ? <BlockIcon /> : <LockOpenIcon />}
                                                </IconButton>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                      </React.Fragment>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              </Paper>
                          </main>
                      </div>
                  </ThemeProvider>
        </>
      )
    }

export default Produit
