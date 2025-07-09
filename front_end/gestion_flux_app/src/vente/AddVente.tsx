import { Alert, Autocomplete, Box, Button, Card, CardContent, Container, createTheme, CssBaseline, Divider, Fade, Grid, IconButton, InputAdornment, MenuItem, Paper, Step, StepLabel, Stepper, TextField, ThemeProvider, Tooltip, Typography } from '@mui/material';
import React, { Component, useEffect, useState } from 'react'
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { BadgeDollarSign, Building2, CalendarDays, FileText, HomeIcon, Package, PhoneIcon, Plus, Receipt, Save, Store, Trash2, Truck, User } from 'lucide-react';
import { Email as EmailIcon, LocationOn as LocationOnIcon } from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person'

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

function AddVente () {

     const location = useLocation();
        const [user, setUser] = useState({ user_id:'', nom:''}); 
        const [formData, setFormData] = useState({
            client_id: '',
            user_id: '',
            date_vente: new Date().toISOString(),
            date_livraison: dayjs().add(1, 'day'),
            paymentTerms: '',
            type_vente: '',
            frais_livraison: 0,
            mode_paiement: '',
            description: '',
            deliveryAddress: '',
            num_vente: 0,
            remise: 0,
            taxes: 0,
            total_ht: 0,
            total_ttc: 0,
            produits: [{ produit_id: '', quantite: '', prix_unitaire: '', total: 0 }],
          });
          const [clients, setclients] = useState([]);
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
            axios.get('http://localhost:4001/gestionFluxDB/client/', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            })
              .then(response => setclients(response.data))
              .catch(error => console.error('Erreur lors de la récupération des clients :', error));
        
            axios.get('http://localhost:4001/gestionFluxDB/produit/', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            })
              .then(response => setProduits(response.data))
              .catch(error => console.error('Erreur lors de la récupération des produits :', error));
        
              const fetchLatestNumvente = async () => {
                try {
                    const response = await axios.get('http://localhost:4001/gestionFluxDB/vente/next-num-vente', {
                      headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    const nextNumVente = response.data.nextNumVente;
                    setFormData(prevState => ({
                        ...prevState,
                        num_vente: nextNumVente
                    }));
                } catch (error) {
                    console.error('Erreur lors de la récupération du dernier numéro d\'vente:', error);
                }
            };
            fetchLatestNumvente();
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
                    const numventeResponse = await axios.get('http://localhost:4001/gestionFluxDB/vente/next-num-vente', {
                      headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    const nextNumVente = numventeResponse.data.nextNumVente;
                      // Préparer les données de l'vente
                      const data = {
                          ...formData,
                          produits: formData.produits.map(p => ({
                              ...p,
                              prix_unitaire: parseFloat(p.prix_unitaire),
                              quantite: parseInt(p.quantite),
                              total: parseFloat(p.prix_unitaire) * parseInt(p.quantite),
                          })),
                          date_vente: new Date(formData.date_vente).toISOString(),
                          num_vente: nextNumVente,
                          remise: formData.remise,
                          taxes: formData.taxes,
                          total_ht: formData.total_ht,
                          total_ttc: formData.total_ttc,
                          date_livraison: formData.date_livraison,
                          paymentTerms: formData.paymentTerms,
                          type_vente: formData.type_vente,
                          mode_paiement: formData.mode_paiement,
                          deliveryAddress: formData.deliveryAddress,
                          frais_livraison: formData.frais_livraison,
                          description: formData.description,
                          user_id: formData.user_id,
                      };
                      
                      // Ajouter l'vente
                      const response = await axios.post('http://localhost:4001/gestionFluxDB/vente/', data,{
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${accessToken}`,
                        },
                      });
              
                      // Réinitialiser le formulaire après l'ajout réussi
                      setFormData({
                          client_id: '',
                          user_id: '',
                          date_vente: new Date().toISOString(),
                          date_livraison: dayjs().add(1, 'day'),
                          paymentTerms: '',
                          mode_paiement: '',
                          type_vente: '',
                          deliveryAddress: '',
                          frais_livraison: 0,
                          description: '',
                          num_vente: 0,
                          remise: 0,
                          taxes: 0,
                          total_ht: 0,
                          total_ttc: 0,
                          produits: [{ produit_id: '', quantite: '', prix_unitaire: '', total: 0 }],
                      });
                      console.log('vente ajouté avec succès:', response.data);
                      alert('vente ajouté avec succès');
                      //navigate('/ventes/list-ventes', { replace: true });
          
                      setShowSuccess(true);
                      setTimeout(() => {
                      navigate("/vente/list-vente", { replace: true });
                }, 1000);
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
        
        const handleclientChange = (e: { target: { name: any; value: any; }; }) => {
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
                  prix_unitaire: selectedProduit.prix_vente,
                  total: parseFloat(selectedProduit.prix_vente) * (produits[index].quantite || 0, 10),
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
          const [newclient, setNewclient] = useState({
            nom: '',
            pays: '',
            ville: '',
            adresse: '',
            email: '',
            telephone: '',
            statut: 'Actif',
          });
        
          const handleChange = (e) => {
            setNewclient({
              ...newclient,
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
              // Envoyer les données du nouveau client au serveur
              const response = await axios.post('http://localhost:4001/gestionFluxDB/client/', newclient,{
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              });
        
              // Mettre à jour le client sélectionné dans formData avec l'ID du nouveau client
              setFormData({
                ...formData,
                client_id: response.data._id,
              });
        
              // Optionnel: ajouter le nouveau client à la liste des clients
              clients.push(response.data);
        
              // Masquer le formulaire après l'enregistrement
              setShowForm(false);
            } catch (error) {
              console.error("Erreur lors de l'ajout du client :", error);
            }
          };
        
          
    const calculateTotals = () => {
            const totalHT = formData.produits.reduce((sum, produit) => {
                return sum + (parseInt(produit.quantite) * parseFloat(produit.prix_unitaire));
            }, 0);
            const fraisTransport = formData.frais_livraison || 0;
            const totalHTAfterDiscount = totalHT - formData.remise;
            const totalTTC = totalHTAfterDiscount + (totalHTAfterDiscount * 0.2) + fraisTransport;
            
        
            setFormData({ ...formData, taxes: 20, total_ht: totalHTAfterDiscount, total_ttc: totalTTC });
            };
            useEffect(() => {
                calculateTotals();
            }, [formData.produits, formData.remise, formData.taxes, formData.frais_livraison]);

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
                const accessToken = sessionStorage.getItem("accessToken");
              
                  if (!accessToken) {
                    console.error("Token manquant. Veuillez vous reconnecter.");
                    return;
                  }
              if (user.user_id) {
                setFormData((prev) => ({ ...prev, user_id: user.user_id }));
              }
            }, [user.user_id]);

            const steps = [
                'Informations générales',
                'Détails de livraison',
                'Produits',
                'Validation',
              ];
            
            const [activeStep, setActiveStep] = useState(0);

            const renderStepContent = (step: number) => {
                switch (step) {
                  case 0:
                    return (
                      <Card elevation={0} sx={{ mb: 3 }}>
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Numéro de commande"
                                value={formData.num_vente}
                                InputProps={{
                                  readOnly: true,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Receipt size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
            
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Créé par"
                                value={user.nom || 'inconnu'}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  readOnly: true,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <User size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
            
                            <Grid item xs={12} md={6}>
                              <DatePicker
                                label="Date de commande"
                                value={dayjs(formData.date_vente)}
                                readOnly
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <CalendarDays size={20} />
                                        </InputAdornment>
                                      ),
                                    },
                                  },
                                }}
                              />
                            </Grid>
            
                            <Grid item xs={12} md={6}>
                              <DatePicker
                                label="Date de livraison"
                                value={formData.date_livraison}
                                onChange={handleDateChange('date_livraison')}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    required: true,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Truck size={20} />
                                        </InputAdornment>
                                      ),
                                    },
                                  },
                                }}
                              />
                            </Grid>
            
                            <Grid item xs={12} md={8}>
                            <Autocomplete
                                options={clients || []} // S'assure que options n'est jamais undefined
                                getOptionLabel={(option) => option.nom || ''} 
                                value={clients.find(f => f._id === formData.client_id) || null}
                                isOptionEqualToValue={(option, value) => option._id === value?._id} 
                                onChange={(event, newValue) => {
                                    setFormData({
                                    ...formData,
                                    client_id: newValue ? newValue._id : '',
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
                                    label="client"
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
            
                            <Grid item xs={12} md={4}>
                              <Button
                                variant="outlined"
                                startIcon={<Plus size={20} />}
                                onClick={() => setShowForm(!showForm)}
                                fullWidth
                                sx={{ height: '56px' }}
                              >
                                Nouveau client
                              </Button>
                              
                            </Grid>
                            {showForm && (
                                    <Grid container spacing={3} style={{ marginTop: '16px' }}>
                                        {/* Première ligne : Nom et Adresse */}
                                        <Grid item xs={12} sm={6}>
                                          <TextField
                                            label="Nom"
                                            name="nom"
                                            value={newclient.nom}
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
                                            value={newclient.pays}
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
                                            value={newclient.ville}
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
                                            value={newclient.adresse}
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
                                            value={newclient.email}
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
                                            value={newclient.telephone}
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
            
                            <Grid item xs={12}  md={4}>
                            
                              <TextField
                                type="string"
                                id="paymentTerms"
                                name="paymentTerms"
                                select
                                value={formData.paymentTerms} 
                                onChange={handleclientChange}
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
                            <Grid item xs={12} md={4}>
                            <TextField
                                type="string"
                                id="mode_paiement"
                                name="mode_paiement"
                                select
                                value={formData.mode_paiement} 
                                onChange={handleclientChange}
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
                            <Grid item xs={12} md={4}>
                            <TextField
                                type="string"
                                id="type_vente"
                                name="type_vente"
                                select
                                value={formData.type_vente} 
                                onChange={handleclientChange}
                                label="Type de Vente"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                              >
                                <MenuItem value="En magasin">En magasin</MenuItem>
                                <MenuItem value="En ligne">En ligne</MenuItem>
                              </TextField>
                              
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
            
                  case 1:
                    return (
                      <Card elevation={0} sx={{ mb: 3 }}>
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom>
                                Partie Optionnelle
                              </Typography>

                              <Grid container spacing={2}> 
  <Grid item xs={12} md={6}>
    <TextField
      label="Adresse de Livraison"
      name="deliveryAddress"
      value={formData.deliveryAddress}
      onChange={handleclientChange}
      fullWidth
      required
      margin="normal"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Truck size={20} />
          </InputAdornment>
        ),
      }}
    />
  </Grid>

  <Grid item xs={12} md={6}>
    <TextField
      type="number"
      label="Frais de Livraison"
      name="frais_livraison"
      value={formData.frais_livraison}
      onChange={handleclientChange}
      fullWidth
      required
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
</Grid>

            
                            <Grid item xs={12}>
                              <TextField
                                label="Description / Notes"
                                name="description"
                                value={formData.description}
                                onChange={handleclientChange}
                                fullWidth
                                required
                                multiline
                                rows={4}
                                margin="normal"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FileText size={20} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
            
                  case 2:
                    return (
                      <Card elevation={0} sx={{ mb: 3 }}>
                        <CardContent>
                          {formData.produits.map((produit, index) => (
                            <Box
                              key={index}
                              sx={{
                                p: 2,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={5}>
                                  <Autocomplete
                                                  options={produits.filter((p) => p.statut !== 'inactif')}
                                                  getOptionLabel={(option) => option.label || ''}
                                                  value={produits.find((p) => p._id === produit.produit_id) || null}
                                                  onChange={(event, newValue) => {
                                                      const updatedProduits = [...formData.produits];
                                                      updatedProduits[index] = {
                                                      ...updatedProduits[index],
                                                      produit_id: newValue ? newValue._id : '',
                                                      prix_unitaire: newValue ? newValue.prix_vente : 0,
                                                      };
                                                      setFormData({ ...formData, produits: updatedProduits });
                                                  }}
                                                  renderInput={(params) => (
                                                      <TextField 
                                                        {...params} 
                                                        label="Produit" 
                                                        fullWidth 
                                                        required
                                                        
                                                      />
                                                  )}
                                                  />
                                </Grid>
            
                                <Grid item xs={12} md={2}>
                                  <TextField
                                      type="number"
                                      name="quantite"
                                      value={produit.quantite}
                                      onChange={(e) => handleProduitChange(e, index)}
                                      label="Quantité"
                                      fullWidth
                                      required
                                      inputProps={{
                                        min: 1, 
                                          }}
                                      />
                                </Grid>
            
                                <Grid item xs={12} md={2}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    name="prix_unitaire"
                                    label="Prix unitaire"
                                    value={produit.prix_unitaire}
                                    InputProps={{
                                      readOnly: true,
                                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                    }}
                                  />
                                </Grid>
            
                                <Grid item xs={12} md={2}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Total"
                                    name="total"
                                    value={produit.total}
                                    InputProps={{
                                      readOnly: true,
                                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                    }}
                                  />
                                </Grid>
            
                                <Grid item xs={12} md={1}>
                                  <Tooltip title="Supprimer">
                                    <IconButton
                                      color="error"
                                      onClick={() => removeProduct(index)}
                                      sx={{ mt: { xs: 1, md: 0 } }}
                                    >
                                      <Trash2 size={20} />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
            
                          <Button
                            variant="outlined"
                            startIcon={<Plus size={20} />}
                            onClick={addProduct}
                            sx={{ mt: 2 }}
                          >
                            Ajouter
                          </Button>
            
                          <Divider sx={{ my: 4 }} />
            
                          <Grid container spacing={2} justifyContent="flex-end">
            
                            {/* bloc Total */}
                            <Grid container item xs={12} >
                                         
                                         <Grid item xs={12}>
                                           <Grid container spacing={2} justifyContent="flex-end">
                                                                          
                                           <Grid item xs={12} md={4}>
                                           <Paper sx={{ p: 2 }}>
                                           <Grid container spacing={2}>
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
                                                     <Typography variant="h6" color="primary">Total TTC:</Typography>
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
                        </CardContent>
                      </Card>
                    );
            
                  case 3:
                    return (
                      <Card elevation={0} sx={{ mb: 3 }}>
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom>
                                Récapitulatif de la commande
                              </Typography>
                              
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Informations générales
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Numéro de commande: {formData.num_vente}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Date de commande: {dayjs(formData.date_vente).format('DD/MM/YYYY')}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Saisi(e) Par : {user.nom || 'Non défini'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Date de livraison: {formData.date_livraison?.format('DD/MM/YYYY')}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Client:{formData.client_id?.nom || (typeof formData.client_id === 'string' 
                                                ? clients.find(c => c._id === formData.client_id)?.nom 
                                                : 'Non spécifié')}
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Conditions de paiement: {formData.paymentTerms}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Mode de paiement: {formData.mode_paiement}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={6}>
                                    <Typography variant="body2">
                                      Type de vente: {formData.type_vente}
                                    </Typography>
                                  </Grid>
                                  
                                </Grid>
                              </Box>
            
                              <Divider sx={{ my: 3 }} />
            
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Produits commandés
                                </Typography>
                                  {/* En-têtes de colonnes */}
                                  <Box sx={{
                                    p: 2,
                                    mb: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'action.hover'
                                  }}>
                                    <Grid container alignItems="center">
                                      <Grid item xs={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Désignation</Typography>
                                      </Grid>
                                      <Grid item xs={2}>
                                        <Typography variant="subtitle2" fontWeight="bold">Qté</Typography>
                                      </Grid>
                                      <Grid item xs={2}>
                                        <Typography variant="subtitle2" fontWeight="bold">PU (€)</Typography>
                                      </Grid>
                                      <Grid item xs={2}>
                                        <Typography variant="subtitle2" fontWeight="bold">Total (€)</Typography>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                
                                {formData.produits.map((product, index) => {
                                  const productDetails = produits.find((p) => p._id === product.produit_id);
                                  return (
                                    <Box
                                      key={index}
                                      sx={{
                                        p: 2,
                                        mb: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Grid container alignItems="center">
                                        <Grid item xs={6}>
                                          <Typography variant="body2">{productDetails?.label}</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Typography variant="body2">{product.quantite} unité(s)</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Typography variant="body2">
                                            {product.prix_unitaire} €
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Typography variant="body2">
                                            {product.total.toFixed(2)} €
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  );
                                })}
                              </Box>
            
                              <Box sx={{ textAlign: 'right', mt: 3 }}>
                              <Typography variant="body2" gutterBottom>
                                  Frais Livraison: {formData.frais_livraison.toFixed(2)} €
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  Total HT: {formData.total_ht ? `${formData.total_ht}` : ''} €
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  Remise ({formData.remise}%): {((formData.total_ht * formData.remise) / 100).toFixed(2)} €
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  TVA ({formData.taxes}%): {((formData.total_ht * formData.taxes) / 100).toFixed(2)} €
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  Net à payer: {formData.total_ttc.toFixed(2)} €
                                </Typography>
                              </Box>

                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
            
                  default:
                    return null;
                }
              };

    return (
      <>
      <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
              <Sidebar />
              <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                <Header />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        <Fade in={showSuccess}>
                        <Alert
                            severity="success"
                            sx={{
                            position: 'fixed',
                            top: 24,
                            right: 24,
                            zIndex: 9999,
                            }}
                        >
                            Commande enregistrée avec succès !
                        </Alert>
                        </Fade>

                        <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                        >
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" gutterBottom color="primary">
                            Nouvelle commande
                            </Typography>
                            <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                            </Stepper>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            {renderStepContent(activeStep)}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={() => setActiveStep((prev) => prev - 1)}
                                type="button"
                            >
                                Précédent
                            </Button>
                            <Box>
                                {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    type="submit"
                                    startIcon={<Save />}
                                >
                                    Enregistrer
                                </Button>
                                ) : (
                                <Button
                                    variant="contained"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault(); // Empêche le submit
                                      setActiveStep((prev) => prev + 1);
                                    }}
                                >
                                    Suivant
                                </Button>
                                )}
                            </Box>
                            </Box>
                        </form>
                        </Paper>
                    </Container>
                    </LocalizationProvider>

                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
        
      </>
    )
  }


export default AddVente
