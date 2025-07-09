import { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Box,
  Container,
  Avatar,
  Typography,
  Link,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {  IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

interface User {
  nom: string;
  role: string;
  email: string;
  telephone: string;
  password: string;
}

interface EditProfileProps {
    profile: User;
    //onEdit: () => void;
    onSave: (updatedProfile: { nom: string; role: string; email: string; telephone: string; password: string }) => void;
    onCancel: () => void;
  }

function EditProfile({ profile, onSave, onCancel }: EditProfileProps) {
  const [formData, setFormData] = useState<Partial<User>>({nom: '',role: '',email: '',telephone: '',password: '', });
  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { id } = useParams(); 
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API :", errorData);
          throw new Error("Erreur lors de la récupération des données");
        }
  
        const data = await response.json();
        console.log("Utilisateur récupéré :", data);
        setUser({
          nom: data.data.nom,
          email: data.data.email,
          role: data.data.role,
          telephone: data.data.telephone,
          password: data.data.password,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };
  
    fetchUser(); 
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        nom: profile.nom,
        email: profile.email,
        telephone: profile.telephone,
        role: profile.role,
        password: profile.password,
      });
    }
  }, [profile]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
        console.error("Token manquant. Veuillez vous reconnecter.");
        alert("Vous devez être connecté pour modifier votre profil.");
        return;
    }

    // Supprimer le champ `password` s'il est vide
    const updatedData = { ...formData };
    if (!updatedData.password || updatedData.password.trim() === "") {
        delete updatedData.password;
    }

    

    console.log("Données envoyées :", updatedData); // Vérifiez ce que vous envoyez

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
            console.error("Erreur API :", responseData);
            alert(responseData.message || "Échec de la mise à jour.");
            return;
        }

        console.log("Mise à jour réussie :", responseData);
        alert("Profil mis à jour avec succès !");
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        alert("Une erreur est survenue lors de la mise à jour.");
    }
};

  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '10px' }}>
          <Header />
          <br />
          <br />
      
            <Container
  component="main"
  maxWidth="xs"
  sx={{
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 3,
    borderRadius: 3,
    boxShadow: 3,
  }}
>
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 100, height: 100 }}>
      <AccountCircleIcon sx={{ fontSize: 80 }} />
    </Avatar>
    <Typography component="h1" variant="h5">
      User Profile
    </Typography>
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Name"
          name="nom"
          value={formData.nom || ''}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Phone Number"
          name="telephone"
          value={formData.telephone || ''}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Email Address"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Role"
          name="role"
          value={formData.role || ''}
          onChange={handleChange}
          fullWidth
          inputProps={{ readOnly: true }}
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password || ""}
          onChange={handleChange}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  </Box>
            </Container>

          
        </main>
      </div>
    </ThemeProvider>
  );
}


export default EditProfile
