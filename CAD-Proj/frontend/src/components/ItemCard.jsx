import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

const ItemCard = ({ item }) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={item.image || "/placeholder-image.jpg"}
        alt={item.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Location Found: {item.location}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date Found: {item.dateFound}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary">
            Claim Item
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ItemCard;