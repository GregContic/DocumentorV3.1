import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  trend = null,
  subtitle = null,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}) => {
  const getTrendColor = (trend) => {
    if (!trend) return 'text.secondary';
    return trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary';
  };

  return (
    <Card
      sx={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient,
          zIndex: 1
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ 
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </Typography>
          <Avatar sx={{ 
            background: gradient,
            width: 48,
            height: 48,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h3" sx={{ 
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
          fontSize: '2.5rem'
        }}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontWeight: 500
          }}>
            {subtitle}
          </Typography>
        )}
        
        {trend !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ 
              color: getTrendColor(trend),
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              ml: 1,
              fontSize: '0.85rem'
            }}>
              from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
