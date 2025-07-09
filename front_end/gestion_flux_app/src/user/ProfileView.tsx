import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

interface User {
  nom: string;
  role: string;
  email: string;
  telephone: string;
  password?: string | null;
}

interface EditProfileProps {
  profile: User;
  onEdit: () => void;
}

function ProfileView({ profile, onEdit }: EditProfileProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    nom: "",
    email: "",
    telephone: "",
    password: "",
  });

  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (profile) {
      setFormData({
        nom: profile.nom,
        email: profile.email,
        telephone: profile.telephone,
        password: profile.password,
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
        const response = await axios.get("http://localhost:4001/gestionFluxDB/users/me/profile", {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        setUser(response.data.data);
        setFormData(response.data.data);
      } catch (error) {
        setSnackbar({ open: true, message: "Erreur lors du chargement du profil", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setSnackbar({ open: true, message: "Vous devez être connecté.", severity: "error" });
      return;
    }
  
   // Supprimer le champ `password` s'il est vide
   const updatedData = { ...formData };
   if (!updatedData.password || updatedData.password.trim() === "") {
       delete updatedData.password;
       //updatedData.password = null;
   }
  
    try {
      const response = await fetch("http://localhost:4001/gestionFluxDB/users/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedData),
      });
  
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Échec de la mise à jour.");
      }
  
      setSnackbar({ open: true, message: "Profil mis à jour avec succès !", severity: "success" });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({ open: true, message: "Échec de la mise à jour", severity: "error" });
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "20px" }}>
          <Header />
          <Container maxWidth="md">
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
              </Box>
            ) : (
              <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 , mt: 8}}>
                <CardContent>
                  <Grid container spacing={4} alignItems="center">
                    {/* Image de profil */}
                    <Grid item xs={12} sm={4} display="flex" justifyContent="center">
                      <Box position="relative">
                        <Avatar
                          src="/path/to/profile.jpg"
                          sx={{ width: 180, height: 180, border: "4px solid #1976d2" }}
                        />
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

                    {/* Informations utilisateur */}
                    <Grid item xs={12} sm={8}>
                      {!isEditing ? (
                        <>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Typography variant="body2" fontWeight="bold" color="textSecondary">
                                Nom :
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1">{user?.nom}</Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                Email :
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1" color="textSecondary">
                                {user?.email}
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                Téléphone :
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1" color="textSecondary">
                                {user?.telephone}
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body2" fontWeight="bold" color="textSecondary">
                                Rôle :
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1" color="primary">
                                {user?.role}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                sx={{ mt: 2, borderRadius: 2 }}
                                onClick={() => setIsEditing(true)}
                                >
                                Modifier
                                </Button>
                            </Grid>
                            </Grid>

                        </>
                      ) : (
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                          <TextField fullWidth margin="normal" name="nom" label="Nom" value={formData.nom || ""} onChange={handleChange} />
                          <TextField fullWidth margin="normal" name="telephone" label="Téléphone" value={formData.telephone || ""} onChange={handleChange} />
                          <TextField fullWidth margin="normal" name="email" label="Email" value={formData.email || ""} onChange={handleChange} />
                          <TextField
                            fullWidth
                            margin="normal"
                            name="password"
                            label="Mot de passe"
                            type={showPassword ? "text" : "password"}
                            value={formData.password || ""}
                            onChange={handleChange}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Box display="flex" justifyContent="space-between" mt={3}>
                            <Button type="submit" variant="contained" color="primary">
                              Enregistrer
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                              Annuler
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Container>
        </main>
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default ProfileView;
