import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as EnrollmentIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  PeopleAlt as InquiriesIcon,
  Description as DocumentIcon,
  SupervisorAccount as SuperAdminIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

const AdminSidebar = ({ open, onClose, variant = 'permanent' }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Define menu items based on user role
  const getMenuItems = (userRole) => {
    if (userRole === 'super-admin') {
      return [
        {
          text: 'Super Admin Dashboard',
          icon: <SuperAdminIcon />,
          path: '/admin/dashboard',
          description: 'Complete system overview'
        },
        {
          text: 'Document Management',
          icon: <DocumentIcon />,
          path: '/admin/documents',
          description: 'Manage document requests'
        },
        {
          text: 'Enrollment Management',
          icon: <EnrollmentIcon />,
          path: '/admin/enrollments',
          description: 'Manage student enrollments'
        },
        {
          text: 'View Archive',
          icon: <ArchiveIcon />,
          path: '/admin/archive',
          description: 'Archived documents and inquiries'
        },
        {
          text: 'Settings',
          icon: <SettingsIcon />,
          path: '/admin/settings',
          description: 'System settings and configuration'
        },
      ];
    } else if (userRole === 'admin-document') {
      return [
        {
          text: 'Document Dashboard',
          icon: <DocumentIcon />,
          path: '/admin/documents',
          description: 'Manage document requests'
        },
        {
          text: 'Inquiries',
          icon: <InquiriesIcon />,
          path: '/admin/inquiries',
          description: 'Handle student inquiries'
        },
        {
          text: 'Document Archive',
          icon: <ArchiveIcon />,
          path: '/admin/document-archive',
          description: 'View archived documents'
        },
      ];
    } else if (userRole === 'admin-enrollment') {
      return [
        {
          text: 'Enrollment Dashboard',
          icon: <EnrollmentIcon />,
          path: '/admin/enrollments',
          description: 'Manage student enrollments'
        },
        {
          text: 'Manage Sections',
          icon: <SettingsIcon />, // You can use a different icon if preferred
          path: '/admin/sections',
          description: 'Create and manage sections for each grade level'
        },
        {
          text: 'Enrollment Archive',
          icon: <ArchiveIcon />,
          path: '/admin/enrollment-archive',
          description: 'View archived enrollments'
        },
      ];
    } else {
      return [
        {
          text: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/admin/dashboard',
          description: 'Overview and document requests'
        },
        {
          text: 'Student Enrollments',
          icon: <EnrollmentIcon />,
          path: '/admin/enrollments',
          description: 'Manage student enrollment applications'
        },
        {
          text: 'View Archive',
          icon: <ArchiveIcon />,
          path: '/admin/archive',
          description: 'Archived documents and inquiries'
        },
        {
          text: 'Settings',
          icon: <SettingsIcon />,
          path: '/admin/settings',
          description: 'System settings and configuration'
        },
      ];
    }
  };

  const menuItems = getMenuItems(user?.role);

  const isSelected = (path) => {
    return location.pathname === path;
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super-admin':
        return 'Super Administrator';
      case 'admin-document':
        return 'Document Administrator';
      case 'admin-enrollment':
        return 'Enrollment Administrator';
      case 'admin':
        return 'Administrator';
      default:
        return 'Administrator';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'admin-document':
        return 'linear-gradient(135deg, #2196f3 0%, #673ab7 100%)';
      case 'admin-enrollment':
        return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%',
      background: getRoleColor(user?.role),
      color: 'white',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(25,118,210,0.9) 0%, rgba(63,81,181,0.9) 100%)',
        zIndex: 1
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar sx={{ 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{ 
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              p: 1.2,
              mr: 2,
              boxShadow: '0 4px 20px rgba(254, 107, 139, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48
            }}>
              {user?.role === 'super-admin' ? <SuperAdminIcon sx={{ color: 'white', fontSize: 24 }} /> :
               user?.role === 'admin-document' ? <DocumentIcon sx={{ color: 'white', fontSize: 24 }} /> :
               user?.role === 'admin-enrollment' ? <EnrollmentIcon sx={{ color: 'white', fontSize: 24 }} /> :
               <DocumentIcon sx={{ color: 'white', fontSize: 24 }} />}
            </Box>
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FFF 30%, #E3F2FD 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {getRoleDisplayName(user?.role)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500
              }}>
                Document Management System
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <List sx={{ px: 2, py: 3 }}>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isSelected(item.path)}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    background: isSelected(item.path) 
                      ? 'linear-gradient(45deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)'
                      : 'transparent',
                    backdropFilter: isSelected(item.path) ? 'blur(10px)' : 'none',
                    border: isSelected(item.path) 
                      ? '1px solid rgba(255,255,255,0.3)' 
                      : '1px solid transparent',
                    boxShadow: isSelected(item.path) 
                      ? '0 8px 32px rgba(0,0,0,0.1)' 
                      : 'none',
                    transition: 'all 0.3s ease-in-out',
                    transform: isSelected(item.path) ? 'translateX(4px)' : 'translateX(0)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transform: 'translateX(4px) translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'white',
                      minWidth: 45,
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                        filter: isSelected(item.path) 
                          ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                          : 'none'
                      }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600} sx={{ 
                        color: 'white',
                        fontSize: '0.95rem',
                        textShadow: isSelected(item.path) 
                          ? '0 1px 2px rgba(0,0,0,0.1)' 
                          : 'none'
                      }}>
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        mt: 0.5
                      }}>
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ 
          flexShrink: 0,
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 2.5
        }}>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.9)',
            display: 'block',
            fontWeight: 600,
            fontSize: '0.8rem'
          }}>
            Eastern La Trinidad National High School
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.7)',
            display: 'block',
            fontSize: '0.75rem',
            mt: 0.5
          }}>
            Document Management System v2.0
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255,255,255,0.6)',
            display: 'block',
            fontSize: '0.7rem',
            mt: 0.5,
            fontStyle: 'italic'
          }}>
            Logged in as: {getRoleDisplayName(user?.role)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
