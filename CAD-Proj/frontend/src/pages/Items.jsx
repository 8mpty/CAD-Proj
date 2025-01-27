import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import ItemCard from '../components/ItemCard';

const Items = () => {
  // Starting out Dummy data ;)
  const items = [
    {
      id: 1,
      name: 'Blue Backpack',
      location: 'Library',
      dateFound: '2025-01-25',
      image: './src/imgs/BlueBackpack.jpeg'
    },
    {
      id: 2,
      name: 'iPhone 15',
      location: 'Cafeteria',
      dateFound: '2025-01-26',
      image: './src/imgs/Iphone15.jpg'
    },
    {
      id: 3,
      name: 'Water Bottle',
      location: 'Gym',
      dateFound: '2025-01-27',
      image: './src/imgs/WaterBottle.jpg'
    }
  ];

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lost Items
        </Typography>
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <ItemCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Items;