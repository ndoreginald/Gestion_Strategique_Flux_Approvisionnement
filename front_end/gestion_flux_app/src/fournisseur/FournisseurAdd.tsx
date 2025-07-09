import { useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import {
  Avatar,
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  TextField,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import { useNavigate } from "react-router-dom";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Email as EmailIcon, Person as PersonIcon, Phone as PhoneIcon, LocationOn as LocationOnIcon, Home as HomeIcon } from "@mui/icons-material";


const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

function FournisseurAdd() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: string; nom: string } | null>(null);
  const [users, setUsers] = useState<{ id: string; nom: string }[]>([]);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    adresse: "",
    ville: "",
    pays: "",
    telephone: "",
    createdBy: currentUser?.id || "",
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");


  // 🔹 Récupérer l'utilisateur connecté
  

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
  
    if (!accessToken) {
      console.log("Token manquant. Veuillez vous reconnecter.");
      navigate('/'); 
      return;
    }
  
    fetch('http://localhost:4001/gestionFluxDB/users/me/profile', { 
      headers: { 'Authorization': `Bearer ${accessToken}` } 
    })
      .then((response) => response.json())
      .then((data) => {
        const user = { id: data.data._id, nom: data.data.nom };
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, createdBy: user.id })); // Préremplir `createdBy`
      })
      .catch((error) => console.error("Erreur lors du chargement de l'utilisateur:", error));
  }, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Vous devez être connecté pour ajouter un fournisseur.");
        navigate('/');
        return;
      }

      const response = await fetch("http://localhost:4001/gestionFluxDB/fournisseur/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSnackbarSeverity("success");
        setSnackbarMessage("fournisseur ajouté avec succès !");
        setOpenSnackbar(true);
        setFormData({ nom: "", email: "", ville: "", pays: "", adresse: "", telephone: "", createdBy: "" });
        navigate('/fournisseurs' , { replace: true });
      } else {
        throw new Error("Erreur lors de l'ajout du fournisseur");
      }
    } catch (error: any) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message);
      setOpenSnackbar(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "20px" }}>
          <Header />
          <Container
            component="main"
            maxWidth="md"
            sx={{
              backgroundColor: "white",
              padding: 4,
              borderRadius: 3,
              boxShadow: 3,
              mt: 8
            }}
          >
            <Typography variant="h5" align="center" gutterBottom>
              Ajouter un fournisseur
            </Typography>

            {/* Avatar avec icône de modification */}
            <Grid container justifyContent="center" sx={{ mb: 2 }}>
              <Box position="relative">
                <Avatar sx={{ width: 120, height: 120, border: "4px solid #1976d2" }} />
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <CameraAltIcon color="primary" />
                </IconButton>
              </Box>
            </Grid>

            {/* Formulaire */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Nom" name="nom" value={formData.nom} onChange={handleChange} required 
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required 
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="pays" name="pays" value={formData.pays} onChange={handleChange} required 
                   InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="ville" name="ville" value={formData.ville} onChange={handleChange} required 
                   InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Adresse" name="adresse" value={formData.adresse} onChange={handleChange} required 
                   InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment> }}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} required 
                   InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}/>
                </Grid>
                <Grid item xs={12}>
                  {/* Sélection du créateur */}
                  <TextField
                    fullWidth
                    label="Créé par"
                    name="createdBy"
                    value={currentUser?.nom || ""}
                    InputProps={{ readOnly: true }}
                    />
                </Grid>
              </Grid>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                Ajouter
              </Button>
            </Box>
          </Container>
        </main>
      </div>

      {/* Snackbar pour les messages de succès/erreur */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}



export default FournisseurAdd
