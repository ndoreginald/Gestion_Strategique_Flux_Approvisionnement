import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Button, CssBaseline, TextField, FormControlLabel, Checkbox, Link, Grid, Box, Typography, Container } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { roles, useAuth } from '../context/AuthContext';
import { useApi } from "../auth/UseApi";
import {  IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const theme = createTheme();

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const api = useApi();
  const [showPassword, setShowPassword] = useState(false);

  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:4001/gestionFluxDB/login/',
        formData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log("Réponse de l'API :", response.data);

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;
      const userRole = response.data.user?.role;

      if (!newAccessToken || !userRole || !newRefreshToken) {
        setError("Login failed, missing access token or role.");
        return;
      }

      // Stocker les données dans sessionStorage (au lieu de localStorage)
      sessionStorage.setItem("accessToken", newAccessToken);
      sessionStorage.setItem("accessToken", newRefreshToken);
      sessionStorage.setItem("userRole", userRole);

      // Définir l'utilisateur comme connecté
      login(newAccessToken, newRefreshToken ,userRole);

      // Redirection selon le rôle de l'utilisateur
      if (userRole === roles.ADMIN) {
        navigate('/users', { replace: true });
      } else if (userRole === roles.USER) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid role');
      }
     

    } catch (error: any) {
      console.error('There was an error signing in the user!', error);
      setError('Invalid email or password');
    }
  };


  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: `url('img/stocks2.jpg')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 70, height: 70 }}>
              <LockOutlinedIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type={showPassword ? "text" : "password"} // Alterner entre "password" et "text"
      id="password"
      autoComplete="new-password"
      value={formData.password || ""}
      onChange={handleChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )
      }}
    />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
              <Grid container>
                <Grid item xs>
                  <Link href="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SignIn;
