import React from 'react';
import { Container, Typography, Box, Button, useTheme, useScrollTrigger, Slide  } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box>
      <Box 
        sx={{
          background: 'linear-gradient(to bottom right, #1976d2, #64b5f6)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3
            }}
          >
            Reunite with Your Lost Items
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 6,
              opacity: 0.9,
              fontWeight: 400
            }}
          >
            Your trusted platform for finding and reporting lost items
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/items"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                },
                borderRadius: 2,
                textTransform: 'none',
                px: 4,
                py: 1.5
              }}
            >
              Browse Lost Items
            </Button>
            <Button
              component={Link}
              to="/report"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'grey.100',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                borderRadius: 2,
                textTransform: 'none',
                px: 4,
                py: 1.5
              }}
            >
              Report Found Item
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;