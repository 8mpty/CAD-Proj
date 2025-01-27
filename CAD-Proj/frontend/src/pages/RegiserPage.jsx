import React from 'react';
import { Container, Paper, Typography, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = ({ onRegister }) => {
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box'
      }}
    >
      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <Paper 
          elevation={10}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.01)'
            },
            width: '100%'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              color: '#1a237e',
              mb: 4
            }}
          >
            Create Account
          </Typography>
          <RegisterForm onRegister={onRegister} />
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;