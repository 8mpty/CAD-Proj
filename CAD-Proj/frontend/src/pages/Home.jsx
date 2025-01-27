import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Lost & Found
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Lost something? Found something? We're here to help!
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            to="/items"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mr: 2 }}
          >
            View Lost Items
          </Button>
          <Button
            component={Link}
            to="/report"
            variant="outlined"
            color="primary"
            size="large"
          >
            Report Found Item
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;