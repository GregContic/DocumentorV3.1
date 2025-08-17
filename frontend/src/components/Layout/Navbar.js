import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Archive as ArchiveIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  QuestionAnswer as InquiryIcon,
  Assignment as RequestsIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useEnrollmentNotifications from '../../hooks/useEnrollmentNotifications';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { hasApprovedEnrollment, enrollmentData } = useEnrollmentNotifications();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  // Hide Navbar on admin dashboard routes
  if (location.pathname.startsWith('/admin')) return null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleNotificationClick = () => {
    setNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleViewEnrollmentStatus = () => {
    setNotificationOpen(false);
    navigate('/enrollment-status');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobile) setMobileOpen(false);
  };

  const navItems = !isAuthenticated 
    ? [
        { text: 'Enrollment', path: '/enrollment', icon: <SchoolIcon /> },
        { text: 'Login', path: '/login', icon: <PersonIcon /> },
        { text: 'Register', path: '/register', icon: <PersonIcon /> }
      ]
    : user?.role === 'admin'
    ? [
        { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { text: 'Archive', path: '/admin/archive', icon: <ArchiveIcon /> },
        { text: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> }
      ]
    : [
        { text: 'Enrollment', path: '/enrollment', icon: <SchoolIcon /> },
        { text: 'Request Document', path: '/request-document', icon: <DescriptionIcon /> },
      ];

  // Menu items that will be in the hamburger dropdown for students
  const studentMenuItems = [
    { text: 'My Requests', path: '/my-requests', icon: <RequestsIcon /> },
    { text: 'Request History', path: '/my-requests-history', icon: <ReceiptIcon /> },
  ];

  const renderDrawerContent = () => (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <SchoolIcon />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Document System
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
        
        {/* Notifications for mobile students */}
        {isAuthenticated && user?.role !== 'admin' && (
          <ListItem 
            button 
            onClick={() => {
              handleNotificationClick();
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              bgcolor: hasApprovedEnrollment ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: hasApprovedEnrollment ? 'rgba(76, 175, 80, 0.2)' : 'rgba(25, 118, 210, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: hasApprovedEnrollment ? 'success.main' : 'primary.main', minWidth: 40 }}>
              <Badge 
                variant="dot" 
                color="error" 
                invisible={!hasApprovedEnrollment}
              >
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText 
              primary={hasApprovedEnrollment ? "Enrollment Approved!" : "Notifications"}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: hasApprovedEnrollment ? 600 : 500,
                color: hasApprovedEnrollment ? 'success.main' : 'inherit'
              }}
            />
          </ListItem>
        )}
        {isAuthenticated && (
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              mx: 1,
              mt: 2,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        backgroundImage: 'linear-gradient(to right, #1976d2, #42a5f5)',
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: 64, md: 70 },
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              fontSize: 32,
              color: 'white' 
            }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.1rem', md: '1.3rem' }
              }}
            >
              DOCUMENTOR: ELTNHS Online Enrollment Portal
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                PaperProps={{
                  sx: {
                    backgroundColor: 'background.paper',
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                  }
                }}
              >
                {renderDrawerContent()}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '1rem',
                    background: user?.role === 'admin' ? 'transparent' : undefined,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  startIcon={item.icon}
                  disableElevation
                >
                  {item.text}
                </Button>
              ))}
              
              {/* Notification button for student users only */}
              {isAuthenticated && user?.role !== 'admin' && (
                <Tooltip title={hasApprovedEnrollment ? "Enrollment Approved!" : "Notifications"} arrow>
                  <IconButton
                    onClick={handleNotificationClick}
                    sx={{
                      color: 'white',
                      bgcolor: hasApprovedEnrollment ? 'success.main' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      ml: 1,
                      '&:hover': {
                        bgcolor: hasApprovedEnrollment ? 'success.dark' : 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <Badge 
                      variant="dot" 
                      color="error" 
                      invisible={!hasApprovedEnrollment}
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: hasApprovedEnrollment ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': {
                              transform: 'scale(0.95)',
                              boxShadow: '0 0 0 0 rgba(255, 82, 82, 0.7)',
                            },
                            '70%': {
                              transform: 'scale(1)',
                              boxShadow: '0 0 0 10px rgba(255, 82, 82, 0)',
                            },
                            '100%': {
                              transform: 'scale(0.95)',
                              boxShadow: '0 0 0 0 rgba(255, 82, 82, 0)',
                            },
                          },
                        }
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Hamburger menu for student users only */}
              {isAuthenticated && user?.role !== 'admin' && (
                <>
                  <Tooltip title="More Options" arrow>
                    <IconButton
                      onClick={handleMenuClick}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        ml: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    {studentMenuItems.map((item) => (
                      <MenuItem
                        key={item.text}
                        onClick={() => handleMenuItemClick(item.path)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderRadius: 1,
                          mx: 0.5,
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        />
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
              
              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    bgcolor: 'error.main',
                    borderRadius: '8px',
                    ml: 2,
                    '&:hover': {
                      bgcolor: 'error.dark',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  startIcon={<LogoutIcon />}
                >
                  Logout
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Notification Dialog */}
      <Dialog
        open={notificationOpen}
        onClose={handleNotificationClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: hasApprovedEnrollment ? 'success.main' : 'primary.main',
          color: 'white'
        }}>
          {hasApprovedEnrollment ? <CheckCircleIcon /> : <NotificationsIcon />}
          <Typography variant="h6" component="div">
            {hasApprovedEnrollment ? 'Enrollment Approved!' : 'Notifications'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {hasApprovedEnrollment && enrollmentData ? (
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <Typography variant="h6" gutterBottom>
                Congratulations! 🎉
              </Typography>
              <Typography variant="body1" paragraph>
                Your enrollment application has been approved on{' '}
                <strong>
                  {enrollmentData.reviewedAt ? 
                    new Date(enrollmentData.reviewedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'recently'
                  }
                </strong>.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Please wait for further instructions or contact the school for next steps.
                You can view your full enrollment status for more details.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body1">
                No new notifications at this time.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                We'll notify you here when there are updates about your enrollment or document requests.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {hasApprovedEnrollment && (
            <Button
              onClick={handleViewEnrollmentStatus}
              variant="contained"
              color="primary"
              startIcon={<SchoolIcon />}
              sx={{ borderRadius: 2 }}
            >
              View Enrollment Status
            </Button>
          )}
          <Button 
            onClick={handleNotificationClose}
            variant={hasApprovedEnrollment ? "outlined" : "contained"}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;