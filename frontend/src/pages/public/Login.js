import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bgImage from '../../assets/eastern.jpg';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = response.data;
      
      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      await login(user, token);
      
      console.log('Login successful - User:', user);
      console.log('Login successful - User role:', user.role);
      
      // Redirect to intended destination or default based on user role
      const from = location.state?.from?.pathname || null;
      
      if (from && from !== '/login') {
        // Redirect to the originally requested page
        console.log('Redirecting to intended page:', from);
        navigate(from, { replace: true });
      } else {
        // Redirect to role-based dashboard
        console.log('Redirecting to role-based dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'blur(3px) opacity(0.9)',
          transform: 'scale(1.1)', // Prevents blur edges
          zIndex: -2,
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Adjust the last number (0.4) to control opacity
          zIndex: -1,
        },
      }}
    >
      <Container 
        maxWidth="xs" 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          py: 4
        }}
      >
        <Fade in timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              width: '100%',
              background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
              borderRadius: '16px',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <SchoolIcon
                    sx={{
                      fontSize: 40,
                      color: 'white',
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    textAlign: 'center',
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: 'center', mb: 3 }}
                >
                  Sign in to continue to Document Request System
                </Typography>
              </Box>

              {success && (
                <Fade in>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                </Fade>
              )}

              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />

                  <TextField
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      }
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 2,
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?
                    </Typography>                  <Link
                      component={RouterLink}
                      to="/register"
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Create an account
                    </Link>
                  </Box>
                </Box>
              </form>
            </Box>
          </Paper>
        </Fade>      </Container>
    </Box>
  );
};

export default Login;
