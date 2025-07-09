import { Alert, Autocomplete, Box, Button, Container, createTheme, CssBaseline, Divider, Fade, Grid, IconButton, InputAdornment, MenuItem, Paper, TableCell, TableHead, TableRow, TextField, ThemeProvider, Typography } from '@mui/material';
import axios from 'axios';
import React, { Component, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import DeleteIcon from '@mui/icons-material/Delete';
import {BadgeDollarSign, Building2, LayoutGrid as ShopIcon, Truck } from 'lucide-react';
import PersonIcon from '@mui/icons-material/Person'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NumbersIcon from '@mui/icons-material/Numbers';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationOnIcon, Home as HomeIcon } from "@mui/icons-material";
import { 
  Package as PackageIcon,
  Tag as TagIcon, 
  FileText as DescriptionIcon, 
  DollarSign as PriceIcon, 
  Image as ImageIcon, 
  Barcode as BarcodeIcon, 
  Calendar as DateIcon,
  Plus as AddIcon,
  Save as SaveIcon,
  LayoutGrid as CategoryIcon
} from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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
            padding: '12px 24px',
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
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  });

function AddAchat () {

     
    const location = useLocation();
    const [user, setUser] = useState({ user_id:'', nom:''}); 
    const [formData, setFormData] = useState({
        fournisseur_id: '',
        user_id: '',
        date_achat: new Date().toISOString(),
        date_prevu: dayjs().add(7, 'day'),
        paymentTerms: '',
        frais_transport: 0,
        mode_paiement: '',
        description: '',
        deliveryAddress: '',
        type: 'Entrée',
        num_achat: 0,
        remise: 0,
        taxes: 20,
        total_ht: 0,
        total_ttc: 0,
        produits: [{ produit_id: '', quantite: '', prix_unitaire: '', total: 0 }],
      });
      const [fournisseurs, setFournisseurs] = useState([]);
      const [showSuccess, setShowSuccess] = useState(false);
      const [produits, setProduits] = useState([]);
      const navigate = useNavigate();
    
      useEffect(() => {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
        axios.get('http://localhost:4001/gestionFluxDB/fournisseur/', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
          .then(response => setFournisseurs(response.data))
          .catch(error => console.error('Erreur lors de la récupération des fournisseurs :', error));
    
        axios.get('http://localhost:4001/gestionFluxDB/produit/', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
          .then(response => setProduits(response.data))
          .catch(error => console.error('Erreur lors de la récupération des produits :', error));
    
          const fetchLatestNumAchat = async () => {
            try {
                const response = await axios.get('http://localhost:4001/gestionFluxDB/achat/next-num-achat', {
                  headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const nextNumAchat = response.data.nextNumAchat;
                setFormData(prevState => ({
                    ...prevState,
                    num_achat: nextNumAchat
                }));
            } catch (error) {
                console.error('Erreur lors de la récupération du dernier numéro d\'achat:', error);
            }
        };
        fetchLatestNumAchat();
      }, [location]);
    
      const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const accessToken = sessionStorage.getItem("accessToken");
          if (!accessToken) {
            console.log("❌ Token manquant. Redirection...");
            navigate('/');
            return;
          }
          const numAchatResponse = await axios.get('http://localhost:4001/gestionFluxDB/achat/next-num-achat', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const nextNumAchat = numAchatResponse.data.nextNumAchat;
            // Préparer les données de l'achat
            const data = {
                ...formData,
                produits: formData.produits.map(p => ({
                    ...p,
                    prix_unitaire: parseFloat(p.prix_unitaire),
                    quantite: parseInt(p.quantite),
                    total: parseFloat(p.prix_unitaire) * parseInt(p.quantite),
                })),
                date_achat: new Date(formData.date_achat).toISOString(),
                num_achat: nextNumAchat,
                remise: formData.remise,
                taxes: formData.taxes,
                total_ht: formData.total_ht,
                total_ttc: formData.total_ttc,
                date_prevu: formData.date_prevu,
                paymentTerms: formData.paymentTerms,
                deliveryAddress: formData.deliveryAddress,
                frais_transport: formData.frais_transport,
                mode_paiement: formData.mode_paiement,
                description: formData.description,
                user_id: formData.user_id,
                type: formData.type
            };
            
            // Ajouter l'achat
            const response = await axios.post('http://localhost:4001/gestionFluxDB/achat/', data,
              {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            });
    
            // Réinitialiser le formulaire après l'ajout réussi
            setFormData({
                fournisseur_id: '',
                user_id: '',
                date_achat: new Date().toISOString(),
                date_prevu: dayjs().add(7, 'day'),
                paymentTerms: '',
                deliveryAddress: '',
                frais_transport: 0,
                mode_paiement: '',
                description: '',
                type: 'Entrée',
                num_achat: 0,
                remise: 0,
                taxes: 20,
                total_ht: 0,
                total_ttc: 0,
                produits: [{ produit_id: '', quantite: '', prix_unitaire: '', total: 0 }],
            });
            console.log('Achat ajouté avec succès:', response.data);
            alert('Achat ajouté avec succès');
            //navigate('/achats/list-achats', { replace: true });

            setShowSuccess(true);
            setTimeout(() => {
            navigate("/achats/list-achats", { replace: true });
      }, 1500);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('Server responded with:', error.response.data);
                    alert(`Error: ${error.response.data.message}`);
                } else if (error.request) {
                    console.error('No response received:', error.request);
                } else {
                    console.error('Error setting up request:', error.message);
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }; 
    
    const handleFournisseurChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value,
        }));
      };
    
      const handleProduitChange = (e, index: number) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        
        setFormData(prevState => {
          const produits = [...prevState.produits];
          produits[index] = {
            ...produits[index],
            [name]: isNaN(numericValue) ? '0' : value,
            total: name === 'quantite'
              ? (isNaN(numericValue) ? 0 : numericValue) * parseFloat(produits[index].prix_unitaire || '0')
              : produits[index].total,
          };
          return {
            ...prevState,
            produits,
          };
        });
      };
    
      const handleProduitSelectChange = async (e, index: number) => {
        const produitId = e.target.value as string;
        const selectedProduit = produits.find(p => p._id === produitId);
        
        if (selectedProduit) {
          setFormData(prevState => {
            const produits = [...prevState.produits];
            produits[index] = {
              ...produits[index],
              produit_id: produitId,
              prix_unitaire: selectedProduit.prix_achat,
              total: parseFloat(selectedProduit.prix_achat) * parseInt(produits[index].quantite || '0', 10),
            };
            return {
              ...prevState,
              produits,
            };
          });
        }
      };
    
      const addProduct = () => {
        setFormData(prevState => ({
          ...prevState,
          produits: [...prevState.produits, { produit_id: '', quantite: '', prix_unitaire: '', total: 0 }],
        }));
      };
    
      const removeProduct = (index: number) => {
        setFormData(prevState => {
          const produits = prevState.produits.filter((_, i) => i !== index);
          return {
            ...prevState,
            produits,
          };
        });
      };
    
      // Fonction pour calculer le total général
      const getTotalGeneral = () => {
        return formData.produits.reduce((acc, produit) => acc + produit.total, 0).toFixed(2);
      };
    
    
      const [showForm, setShowForm] = useState(false);
      const [newFournisseur, setNewFournisseur] = useState({
        nom: '',
        pays: '',
        ville: '',
        adresse: '',
        email: '',
        telephone: '',
        statut: 'Actif',
      });
    
      const handleChange = (e) => {
        setNewFournisseur({
          ...newFournisseur,
          [e.target.name]: e.target.value,
        });
      };
    
      const handleSave = async () => {
        try {
          const accessToken = sessionStorage.getItem("accessToken");
          if (!accessToken) {
            alert("Vous devez être connecté...");
            navigate("/");
            return;
          }
          // Envoyer les données du nouveau fournisseur au serveur
          const response = await axios.post('http://localhost:4001/gestionFluxDB/fournisseur/', newFournisseur,{
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
    
          // Mettre à jour le fournisseur sélectionné dans formData avec l'ID du nouveau fournisseur
          setFormData({
            ...formData,
            fournisseur_id: response.data._id,
          });
    
          // Optionnel: ajouter le nouveau fournisseur à la liste des fournisseurs
          fournisseurs.push(response.data);
    
          // Masquer le formulaire après l'enregistrement
          setShowForm(false);
        } catch (error) {
          console.error("Erreur lors de l'ajout du fournisseur :", error);
        }
      };
    
      
      const calculateTotals = () => {
        const totalHT = formData.produits.reduce((sum, produit) => {
            return sum + (parseInt(produit.quantite) * parseFloat(produit.prix_unitaire));
        }, 0);
        const fraisTransport = formData.frais_transport || 0;
        const totalHTAfterDiscount = totalHT - formData.remise;
        const totalTTC = totalHTAfterDiscount + (totalHTAfterDiscount * 0.2) + fraisTransport;
        
    
        setFormData({ ...formData, taxes: 20, total_ht: totalHTAfterDiscount, total_ttc: totalTTC });
        };
        useEffect(() => {
            calculateTotals();
        }, [formData.produits, formData.remise, formData.taxes, formData.frais_transport]);

        const handleDateChange = (name: string) => (value: Dayjs | null) => {
          setFormData((prevState) => ({
            ...prevState,
            [name]: value, // Met à jour la date dans l'état
          }));
        };

        
          useEffect(() => {
            const fetchUser = async () => {
              const accessToken = sessionStorage.getItem("accessToken");
          
              if (!accessToken) {
                console.error("Token manquant. Veuillez vous reconnecter.");
                return;
              }
          
              try {
                let response = await fetch("http://localhost:4001/gestionFluxDB/users/me/profile", {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
          
                if (!response.ok) {
                  const errorData = await response.json();
                  console.error("Erreur API :", errorData);
                  throw new Error("Erreur lors de la récupération des données");
                }
          
                const data = await response.json();
                console.log("Utilisateur récupéré :", data);
          
                // Modifié ici pour accéder à la bonne structure des données
                setUser({  user_id: data.data.userId, nom: data.data.nom }); 
              } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
              }
            };
          
            fetchUser();
          }, []);

          // Mettre à jour formData avec user_id lorsqu'il est récupéré
          useEffect(() => {
          if (user.user_id) {
            setFormData((prev) => ({ ...prev, user_id: user.user_id }));
          }
        }, [user.user_id]);
    

    return (
     
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Fade in={showSuccess}>
                <Alert 
                            severity="success" 
                            sx={{ 
                              position: 'fixed', 
                              top: 24, 
                              right: 24, 
                              zIndex: 9999,
                              boxShadow: theme.shadows[3],
                            }}
                          >
                            Catégorie créée avec succès!
                </Alert>
            </Fade>
            <Paper 
                elevation={0} 
                sx={{ 
                p: 4, 
                borderRadius: 3,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
                }}
            >
            <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <ShopIcon   
                    size={32}
                    style={{ 
                      color: theme.palette.primary.main,
                      marginRight: theme.spacing(2)
                    }} 
                  />
                  <Typography variant="h4" color="primary.main">
                    Nouveau Achat
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={(e) => {
                e.preventDefault();
                // Première confirmation
                if (window.confirm("Êtes-vous sûr de vouloir ajouter cette vente ?")) {
                    handleSubmit(e);
                } }}>
             <fieldset style={{backgroundColor: 'white' , border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}></legend>
              <Grid container spacing={3}>
              <Grid container item xs={12} style={{ alignItems: 'center' }} spacing={2}>
                  
                  <Grid item xs={5}>
                    <TextField
                      variant="outlined"
                      value={formData.num_achat}
                      fullWidth
                      label="Num Achat"
                      InputProps={{startAdornment: (
                        <InputAdornment position="start">
                          <NumbersIcon />
                        </InputAdornment>
                      ),
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={1} /> {/* Empty grid item for spacing */}
                  <Grid item xs={5}>
                    <TextField
                      name="user_nom"
                      value={user.nom || 'inconnu'} 
                      label="Saisi par "
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),readOnly: true }}
                      required
                    />
                  </Grid>
   
                  
                  <Grid item xs={5}>
                    <TextField
                      type="date"
                      id="date_achat"
                      name="date_achat"
                      value={formData.date_achat.split('T')[0]} 
                      onChange={handleFournisseurChange}
                      label="Date de l'achat"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthIcon />
                        </InputAdornment>
                      ),readOnly: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={1} /> {/* Empty grid item for spacing */}
                  <Grid item xs={5}>
                  <DatePicker
                  label="Date de livraison souhaitée"
                  value={formData.date_prevu}
                  onChange={handleDateChange('date_prevu')} // Utilise la nouvelle fonction
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      InputLabelProps: { shrink: true },
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon />
                          </InputAdornment>
                        ),
                },
              },
            }}
          />
                  </Grid>
                  
                  <Grid item xs={4}>
                  <Autocomplete
                      options={fournisseurs || []} // S'assure que options n'est jamais undefined
                      getOptionLabel={(option) => option.nom || ''} 
                      value={fournisseurs.find(f => f._id === formData.fournisseur_id) || null}
                      isOptionEqualToValue={(option, value) => option._id === value?._id} // Corrigé
                      onChange={(event, newValue) => {
                        setFormData({
                          ...formData,
                          fournisseur_id: newValue ? newValue._id : '',
                        });
                      }}
                      filterOptions={(options, state) => {
                        return options.filter(option =>
                          option.nom.toLowerCase().includes(state.inputValue.toLowerCase()) // Filtrage manuel
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Fournisseur"
                          fullWidth
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Building2 />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                      </Grid>
                  <Grid item xs={2}>
                  <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
                    New
                  </Button>
                </Grid>
                  <Grid item xs={3}>
                    <TextField
                      type="string"
                      id="paymentTerms"
                      name="paymentTerms"
                      select
                      value={formData.paymentTerms} 
                      onChange={handleFournisseurChange}
                      label="Conditions de paiement"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    >
                      <MenuItem value="IMMEDIATE">Paiement immédiat</MenuItem>
                      <MenuItem value="15_DAYS">15 jours</MenuItem>
                      <MenuItem value="30_DAYS">30 jours</MenuItem>
                      <MenuItem value="60_DAYS">60 jours</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      type="string"
                      id="mode_paiement"
                      name="mode_paiement"
                      select
                      value={formData.mode_paiement} 
                      onChange={handleFournisseurChange}
                      label="Mode de paiement"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    >
                      <MenuItem value="Carte">Carte</MenuItem>
                      <MenuItem value="Espèces">Espèces</MenuItem>
                      <MenuItem value="Virement">Virement</MenuItem>
                    </TextField>
                  </Grid>
                  
                  
                </Grid>
                </Grid>

                
            

      {showForm && (
        <Grid container spacing={3} style={{ marginTop: '16px' }}>
            {/* Première ligne : Nom et Adresse */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom"
                name="nom"
                value={newFournisseur.nom}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
               
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                    ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="pays"
                name="pays"
                value={newFournisseur.pays}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                    ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ville"
                name="ville"
                value={newFournisseur.ville}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                    ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Adresse"
                name="adresse"
                value={newFournisseur.adresse}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon />
                  </InputAdornment>
                    ),
                }}
              />
            </Grid>

            {/* Deuxième ligne : Email et Téléphone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={newFournisseur.email}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                    ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Téléphone"
                name="telephone"
                value={newFournisseur.telephone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                
                inputProps={{
                  inputMode: 'numeric', // Affiche un pavé numérique sur mobile
                  pattern: '[0-9]*' ,// Accepte uniquement les chiffres
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                      ),
                }}
              />
            </Grid>

            <Grid container spacing={2} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Grid item>
                <Button variant="contained" color="secondary" onClick={handleSave}>
                  Enregistrer
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="error" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </Grid>
            </Grid>
          </Grid>
      )}
              
            </fieldset><br /><br />
            <Divider sx={{ mb: 4 }} />

            <fieldset style={{backgroundColor: 'white' , border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}></legend>
              <Grid container spacing={3}>
              <Grid container item xs={12} style={{ alignItems: 'center' }} spacing={2}>
                  
                  <Grid item xs={5}>
              <TextField
                label="Adresse de Livraison"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleFournisseurChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <Truck />
                  </InputAdornment>
                    ),
                }}
              />
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={5}>
              <TextField
                type="number"
                label="Frais de Livraison"
                name="frais_transport"
                value={formData.frais_transport}
                onChange={handleFournisseurChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <BadgeDollarSign size={20} />
                  </InputAdornment>
                    ),
                }}
              />
              </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFournisseurChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                InputProps={{ startAdornment: (
                  <InputAdornment position="start">
                    <TextSnippetIcon />
                  </InputAdornment>
                ) }}
                
              />
            </Grid>
          </Grid>
        </Grid>

              
            </fieldset><br /><br />
            <Divider sx={{ mb: 4 }} />
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey' }}>
                <TableCell style={{ color: 'white' , fontSize: '1rem' ,fontWeight: 'bold', width: '40%' , textAlign: 'center'}}>Désignation</TableCell>
                <TableCell style={{ color: 'white' , fontSize: '1rem' ,fontWeight: 'bold', width: '20%',textAlign: 'center'}}>Quantité</TableCell>
                <TableCell style={{ color: 'white' , fontSize: '1rem' ,fontWeight: 'bold', width: '20%', textAlign: 'center'}}>Prix unitaire</TableCell>
                <TableCell style={{ color: 'white' , fontSize: '1rem' ,fontWeight: 'bold', width: '20%', }}>Total</TableCell>
                <TableCell style={{ width: '10%' }}></TableCell> {/* Empty cell for delete icon */}
              </TableRow>
            </TableHead>

            {formData.produits.map((produit, index) => (
        <fieldset key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '16px', backgroundColor: 'white' }}>
  
            <Grid container spacing={2} alignItems="center">
            <Grid item xs={5}>
                <Autocomplete
                options={produits.filter((p) => p.statut !== 'inactif')}
                getOptionLabel={(option) => option.label || ''}
                value={produits.find((p) => p._id === produit.produit_id) || null}
                onChange={(event, newValue) => {
                    const updatedProduits = [...formData.produits];
                    updatedProduits[index] = {
                    ...updatedProduits[index],
                    produit_id: newValue ? newValue._id : '',
                    prix_unitaire: newValue ? newValue.prix_achat : 0,
                    };
                    setFormData({ ...formData, produits: updatedProduits });
                }}
                renderInput={(params) => (
                    <TextField 
                      {...params} 
                      //label="Produit" 
                      fullWidth 
                      required 
                    />
                )}
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                type="number"
                name="quantite"
                value={produit.quantite}
                onChange={(e) => handleProduitChange(e, index)}
                //label="Quantité"
                fullWidth
                required
                inputProps={{
                  min: 1, // Valeur minimale autorisée
                }}
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                type="number"
                name="prix_unitaire"
                value={produit.prix_unitaire}
                //label="Prix unitaire"
                fullWidth
                InputProps={{ readOnly: true }}
                required
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                type="number"
                name="total"
                value={produit.total}
                //label="Total"
                fullWidth
                InputProps={{ readOnly: true }}
                />
            </Grid>
            <Grid item xs={1}>
                <IconButton onClick={() => removeProduct(index)} 
                aria-label="delete">
                <DeleteIcon />
                </IconButton>
            </Grid>
            </Grid>
        </fieldset>
        ))}
              <IconButton  onClick={addProduct} ><AddCircleIcon /> </IconButton>
          
              <br />
              <br />
              <Divider sx={{ mb: 4 }} />
<br />
              <fieldset style={{ backgroundColor: 'white' ,border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginTop: '16px' }}>
              <Grid container spacing={3} alignItems="center">
             
            {/* bloc Total */}
            <Grid container item xs={12} >
           
                                <Grid item xs={12}>
                                  <Grid container spacing={2} justifyContent="flex-end">
                                   
                                    <Grid item xs={12} md={4}>
                                      <Paper sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={6}>
                                            <Typography>Frais de Livraison:</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography align="right">
                                              {formData.frais_transport} €
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography>total HT:</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography align="right">
                                              {formData.total_ht ? `${formData.total_ht}` : ''} €
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography>TVA:</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography align="right">
                                              {formData.taxes} (%)
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography>Remise:</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <TextField
                                              size="small"
                                              type="number"
                                              value={formData.remise}
                                              onChange={(e) => setFormData({ ...formData, remise: parseFloat(e.target.value) || 0 })}
                                              InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                              }}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <Divider sx={{ my: 1 }} />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography variant="h6">Net à payer:</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography variant="h6" align="right">
                                              {formData.total_ttc ? `${formData.total_ttc}` : ''} €
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </Paper>
                                    </Grid>
                                  </Grid>
                                </Grid>
            </Grid>
           
          </Grid>
              </fieldset>
              <Grid item xs={12} style={{ marginTop: '24px' }} >
             
                <Grid container spacing={2} justifyContent="center">
                
                  <Grid item xs={12} sm={6}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                    Ajouter l'achat
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ 
                        backgroundColor: '#d32f2f',
                        '&:hover': {
                          backgroundColor: '#b71c1c',
                        }
                      }}
                      onClick={() => navigate(`/achats/list-achats`)}
                    >
                      Annuler l'achat
                    </Button>
                  </Grid>
                </Grid>
              </Grid> 
              
                    </form>
                    </LocalizationProvider>
            </Box>
          </Paper>
        </Container>
        </Box>
      </Box>
    </ThemeProvider>
    )
  }


export default AddAchat
