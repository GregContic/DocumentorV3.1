import easternestetik from '../../assets/easternestetik.png';
import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Speed as SpeedIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CloudQueue as CloudIcon,
  Smartphone as MobileIcon,
  AutoAwesome as SparkleIcon,
  VerifiedUser as ShieldIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const features = [
    {
      icon: <DocumentIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />,
      title: 'Digital Document Management',
      description: 'Request and manage all your academic documents online with our streamlined digital platform.',
      gradient: 'linear-gradient(135deg, rgba(33, 150, 243, 0.8), rgba(103, 58, 183, 0.8))',
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />,
      title: 'Online Enrollment System',
      description: 'Complete your school enrollment application online with our easy-to-use digital enrollment platform.',
      gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.8), rgba(139, 195, 74, 0.8))',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />,
      title: 'Lightning Fast Processing',
      description: 'Experience rapid document processing with real-time status updates and instant notifications.',
      gradient: 'linear-gradient(135deg, rgba(255, 152, 0, 0.8), rgba(255, 193, 7, 0.8))',
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />,
      title: 'Bank-Level Security',
      description: 'Your sensitive information is protected with enterprise-grade encryption and security protocols.',
      gradient: 'linear-gradient(135deg, rgba(244, 67, 54, 0.8), rgba(233, 30, 99, 0.8))',
    },
    {
      icon: <CloudIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />,
      title: 'Cloud Integration',
      description: 'Access your documents anywhere, anytime with seamless cloud synchronization and backup.',
      gradient: 'linear-gradient(135deg, rgba(0, 188, 212, 0.8), rgba(0, 150, 136, 0.8))',
    },
  ];
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }
    }}>
      {/* Glassmorphic Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Floating geometric shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 100,
            height: 100,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            backdropFilter: 'blur(10px)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: 80,
            height: 80,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            borderRadius: '50%',
            backdropFilter: 'blur(8px)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '20%',
            width: 120,
            height: 60,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            borderRadius: '50px',
            backdropFilter: 'blur(12px)',
            animation: 'float 10s ease-in-out infinite',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} lg={7}>
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  p: { xs: 4, md: 6 },
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.1)',
                  animation: 'slideInLeft 1s ease-out',
                  maxWidth: { xs: '100%', md: 650, lg: 800 },
                  width: { xs: '100%', md: 650, lg: 800 },
                  ml: { xs: 0, md: -4, lg: -8 },
                  '@keyframes slideInLeft': {
                    '0%': { opacity: 0, transform: 'translateX(-50px)' },
                    '100%': { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                <Chip
                  label="✨ Welcome to the Future of Education"
                  sx={{ 
                    mb: 3,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                />
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    background: 'linear-gradient(45deg, #ffffff, #e3f2fd, #ffffff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                    fontFamily: '"Nunito", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ELTNHS Online Enrollment Portal
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4,
                    fontWeight: 300,
                    lineHeight: 1.4,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  Your Digital Gateway to Academic Excellence
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 5,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  Experience the next generation of document management and enrollment 
                  with our AI-powered, glassmorphic interface designed for the modern student.
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          py: 2,
                          px: 5,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                          color: '#1976d2',
                          border: 0,
                          borderRadius: '25px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 12px 24px rgba(255,255,255,0.2)',
                          fontFamily: '"Nunito", sans-serif',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, rgba(255,255,255,1), rgba(255,255,255,0.9))',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 32px rgba(255,255,255,0.3)',
                          },
                        }}
                        startIcon={<SparkleIcon />}
                      >
                        Launch Portal
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                          py: 2,
                          px: 5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: '25px',
                          borderColor: 'rgba(255,255,255,0.4)',
                          color: 'white',
                          borderWidth: '2px',
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          fontFamily: '"Nunito", sans-serif',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: 'rgba(255,255,255,0.8)',
                            background: 'rgba(255,255,255,0.15)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                        startIcon={<MobileIcon />}
                      >
                        Get Started
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => 
                        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/request-document')
                      }
                      sx={{
                        py: 2,
                        px: 5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                        color: '#1976d2',
                        border: 0,
                        borderRadius: '25px',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 12px 24px rgba(255,255,255,0.2)',
                        fontFamily: '"Nunito", sans-serif',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(255,255,255,1), rgba(255,255,255,0.9))',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 16px 32px rgba(255,255,255,0.3)',
                        },
                      }}
                      startIcon={<SparkleIcon />}
                    >
                      Enter Dashboard
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>      {/* Glassmorphic Features Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ 
              mb: 3,
              fontWeight: 800,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: '"Nunito", sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            Future-Ready Features
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 300,
              fontFamily: '"Nunito", sans-serif',
              lineHeight: 1.6,
            }}
          >
            Discover the next generation of educational technology designed for the modern world
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(60px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: feature.gradient,
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-16px) scale(1.02)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotateY(10deg)',
                      background: feature.gradient,
                    },
                    '& .feature-content': {
                      transform: 'translateY(-4px)',
                    }
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    className="feature-icon"
                    sx={{ 
                      mb: 3,
                      transition: 'all 0.4s ease',
                      display: 'inline-flex',
                      p: 3,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      alignSelf: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box className="feature-content" sx={{ transition: 'all 0.3s ease', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.95)',
                        mb: 2,
                        fontFamily: '"Nunito", sans-serif',
                        fontSize: '1.4rem'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        color: 'rgba(255,255,255,0.75)',
                        lineHeight: 1.7,
                        fontFamily: '"Nunito", sans-serif',
                        flexGrow: 1,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Glassmorphic How It Works Section */}
      <Box sx={{ 
        position: 'relative',
        py: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(2px)',
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ 
                mb: 3,
                fontWeight: 800,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Nunito", sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Simple & Elegant Process
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 300,
                fontFamily: '"Nunito", sans-serif',
                lineHeight: 1.6,
              }}
            >
              Two streamlined steps to access your educational future
            </Typography>
          </Box>
          
          <Grid container spacing={6}>
            {[
              {
                title: '1. Create Account',
                description: 'Sign up with your email and basic information to get started with our secure, AI-powered platform designed for the future of education.',
                image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                gradient: 'linear-gradient(135deg, #4CAF50, #81C784)',
              },
              {
                title: '2. Submit & Track',
                description: 'Fill out comprehensive forms or enrollment applications with AI assistance, then track your progress in real-time with our advanced notification system.',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)',
              },
            ].map((step, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `slideInUp 0.8s ease-out ${index * 0.3}s both`,
                    '@keyframes slideInUp': {
                      '0%': { opacity: 0, transform: 'translateY(80px) rotateX(10deg)' },
                      '100%': { opacity: 1, transform: 'translateY(0) rotateX(0deg)' },
                    },
                    '&:hover': {
                      transform: 'translateY(-20px) scale(1.03)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
                      '& .step-image': {
                        transform: 'scale(1.1) rotateZ(2deg)',
                      },
                      '& .step-number': {
                        transform: 'scale(1.3) rotate(360deg)',
                        background: step.gradient,
                      },
                      '& .step-content': {
                        transform: 'translateY(-8px)',
                      }
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden', height: 250 }}>
                    <CardMedia
                      className="step-image"
                      component="img"
                      height="250"
                      image={step.image}
                      alt={step.title}
                      sx={{
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: 'brightness(0.8) contrast(1.1)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
                      }}
                    />
                    <Box
                      className="step-number"
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        fontFamily: '"Nunito", sans-serif',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {index + 1}
                    </Box>
                  </Box>
                  <CardContent className="step-content" sx={{ p: 4, transition: 'all 0.3s ease' }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.95)',
                        mb: 2,
                        fontFamily: '"Nunito", sans-serif',
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        fontFamily: '"Nunito", sans-serif',
                      }}
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Glassmorphic Call to Action Section */}
      <Box
        sx={{
          position: 'relative',
          py: 10,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(5px)',
          },
        }}
      >
        {/* Floating elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 200,
            height: 200,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            borderRadius: '50%',
            backdropFilter: 'blur(15px)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 150,
            height: 150,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            backdropFilter: 'blur(10px)',
            animation: 'float 6s ease-in-out infinite reverse',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(30px)',
              borderRadius: '40px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              p: { xs: 6, md: 8 },
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <SparkleIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.8)', mb: 2 }} />
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 4,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Nunito", sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Transform Your Future?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                color: 'rgba(255,255,255,0.8)',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.6,
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 300,
              }}
            >
              Join thousands of students who have already embraced the future of education. 
              Experience seamless document management and enrollment with cutting-edge technology.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 4, 
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  py: 2.5,
                  px: 8,
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
                  color: '#1976d2',
                  border: 0,
                  borderRadius: '30px',
                  boxShadow: '0 16px 32px rgba(255,255,255,0.2)',
                  fontFamily: '"Nunito", sans-serif',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, rgba(255,255,255,1), rgba(255,255,255,0.95))',
                    transform: 'translateY(-6px) scale(1.05)',
                    boxShadow: '0 24px 48px rgba(255,255,255,0.3)',
                  },
                }}
                startIcon={<SparkleIcon />}
              >
                Start Your Journey
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  py: 2.5,
                  px: 8,
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  borderRadius: '30px',
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'white',
                  borderWidth: '2px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  fontFamily: '"Nunito", sans-serif',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
                startIcon={<MobileIcon />}
              >
                Sign In Now
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Glassmorphic Services Section */}
      <Box sx={{ 
        py: 10,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ 
                mb: 3,
                fontWeight: 800,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Nunito", sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Our Premium Services
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 300,
                fontFamily: '"Nunito", sans-serif',
                lineHeight: 1.6,
              }}
            >
              Comprehensive educational services designed for the digital age
            </Typography>
          </Box>
          
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5, #81c784)',
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-16px) scale(1.02)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                    '& .service-avatar': {
                      transform: 'scale(1.1) rotateY(15deg)',
                      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    },
                    '& .service-content': {
                      transform: 'translateY(-8px)',
                    }
                  },
                }}
                onClick={() => navigate('/enrollment')}
              >
                <CardContent sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Avatar
                    className="service-avatar"
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 4,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.9)' }} />
                  </Avatar>
                  <Box className="service-content" sx={{ transition: 'all 0.3s ease', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'rgba(255,255,255,0.95)', fontFamily: '"Nunito", sans-serif' }}>
                      Student Enrollment
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, fontFamily: '"Nunito", sans-serif' }}>
                      Eastern La Trinidad National High School
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', fontFamily: '"Nunito", sans-serif', flexGrow: 1 }}>
                      Complete your enrollment application for School Year 2025-2026 with our AI-powered, 
                      futuristic interface. Multi-step process with intelligent document validation.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                      <Chip 
                        label="Grades 7-12" 
                        sx={{ 
                          background: 'rgba(255,255,255,0.1)', 
                          color: 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          fontFamily: '"Nunito", sans-serif'
                        }} 
                      />
                      <Chip 
                        label="AI-Powered" 
                        sx={{ 
                          background: 'rgba(76,175,80,0.2)', 
                          color: 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(76,175,80,0.3)',
                          fontFamily: '"Nunito", sans-serif'
                        }} 
                      />
                      <Chip 
                        label="Future-Ready" 
                        sx={{ 
                          background: 'rgba(33,150,243,0.2)', 
                          color: 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(33,150,243,0.3)',
                          fontFamily: '"Nunito", sans-serif'
                        }} 
                      />
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                        color: '#1976d2',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontFamily: '"Nunito", sans-serif',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(255,255,255,1), rgba(255,255,255,0.9))',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      startIcon={<SparkleIcon />}
                    >
                      Launch Enrollment
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d, #ffc107)',
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-16px) scale(1.02)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                    '& .service-avatar': {
                      transform: 'scale(1.1) rotateY(15deg)',
                      background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                    },
                    '& .service-content': {
                      transform: 'translateY(-8px)',
                    }
                  },
                }}
                onClick={() => navigate(isAuthenticated ? '/request-document' : '/login')}
              >
                <CardContent sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Avatar
                    className="service-avatar"
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 4,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.9)' }} />
                  </Avatar>
                  <Box className="service-content" sx={{ transition: 'all 0.3s ease', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'rgba(255,255,255,0.95)', fontFamily: '"Nunito", sans-serif' }}>
                      Document Requests
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, fontFamily: '"Nunito", sans-serif' }}>
                      Academic Records & Certificates
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', fontFamily: '"Nunito", sans-serif', flexGrow: 1 }}>
                      Request official academic documents with our intelligent processing system. 
                      Real-time tracking, AI validation, and seamless digital delivery.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                      <Chip 
                        label="Form 137" 
                        sx={{ 
                          background: 'rgba(255,255,255,0.1)', 
                          color: 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          fontFamily: '"Nunito", sans-serif'
                        }} 
                      />
                      <Chip 
                        label="Real-time Tracking" 
                        sx={{ 
                          background: 'rgba(255,152,0,0.2)', 
                          color: 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,152,0,0.3)',
                          fontFamily: '"Nunito", sans-serif'
                        }} 
                      />
                      <Chip 
                        label="Digital Delivery" 
                        sx={{ 
                          background: 'rgba(156,39,176,0.2)', 
                          color: 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(156,39,176,0.3)',
                          fontFamily: '"Nunito", sans-serif'
                        }} 
                      />
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                        color: '#ff9800',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontFamily: '"Nunito", sans-serif',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(255,255,255,1), rgba(255,255,255,0.9))',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      startIcon={<DocumentIcon />}
                    >
                      {isAuthenticated ? 'Access Documents' : 'Login to Access'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Futuristic QR Code Section */}
      <Box sx={{ py: 10, position: 'relative' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Nunito", sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Instant Access Portal
            </Typography>
            <Typography variant="h5" sx={{ maxWidth: '600px', mx: 'auto', color: 'rgba(255,255,255,0.8)', fontFamily: '"Nunito", sans-serif', fontWeight: 300 }}>
              Scan these quantum-encoded QR codes for immediate access to our services
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                data: `${window.location.origin}/enrollment`,
                title: "Enrollment Portal",
                description: "Access the future of education enrollment",
                icon: <SchoolIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.9)' }} />,
                gradient: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              },
              {
                data: `${window.location.origin}/request/form-137`,
                title: "Form 137 Hub",
                description: "Instant document request access",
                icon: <DocumentIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.9)' }} />,
                gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)',
              },
              {
                data: `${window.location.origin}/track`,
                title: "Status Tracker",
                description: "Real-time request monitoring",
                icon: <SpeedIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.9)' }} />,
                gradient: 'linear-gradient(135deg, #4caf50, #81c784)',
              },
              {
                data: JSON.stringify({
                  type: 'contact_info',
                  school: 'Eastern La Trinidad National High School',
                  phone: '+63-XXX-XXX-XXXX',
                  email: 'info@eltnhs.edu.ph',
                  address: 'La Trinidad, Benguet, Philippines'
                }),
                title: "Contact Matrix",
                description: "School information database",
                icon: <SupportIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.9)' }} />,
                gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
              },
            ].map((qr, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: qr.gradient,
                      transform: 'scaleX(0)',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
                      '&::before': {
                        transform: 'scaleX(1)',
                      },
                      '& .qr-icon': {
                        transform: 'scale(1.2) rotateY(15deg)',
                        background: qr.gradient,
                      }
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box 
                      className="qr-icon"
                      sx={{ 
                        mb: 3,
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      {qr.icon}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <QRCodeDisplay
                        data={qr.data}
                        size={120}
                        title={qr.title}
                        description={qr.description}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: '"Nunito", sans-serif', fontWeight: 700, mb: 1 }}>
                      {qr.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Nunito", sans-serif' }}>
                      {qr.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;