import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions 
} from "@mui/material";

const ItemCard = ({ item, onClaimSuccess }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const theme = useTheme();

  const handleClaimConfirm = async () => {
    setClaiming(true);
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_AWS_URL}:3001/api/items/${item.id}/claim`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to claim item");
      }

      const updatedItem = await response.json();
      onClaimSuccess(updatedItem);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error claiming item:", error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Card 
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardMedia
        component="img"
        height="240"
        image={item.image_url}
        alt={item.name}
        sx={{
          objectFit: 'cover',
          filter: item.claimed_status ? 'grayscale(100%)' : 'none'
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {item.name}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            📍 {item.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📅 {new Date(item.date_found).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🏷️ {item.category}
          </Typography>
        </Box>
        <Button
          variant="contained"
          fullWidth
          disabled={item.claimed_status}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            py: 1.5,
            fontWeight: 500
          }}
        >
          {item.claimed_status ? 'Already Claimed' : 'Claim Item'}
        </Button>
      </CardContent>
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>Confirm Claim</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to claim this item?
            <Box component="ul" sx={{ mt: 2, pl: 2 }}>
              <li>Item: {item.name}</li>
              <li>Category: {item.category}</li>
              <li>Location: {item.location}</li>
            </Box>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClaimConfirm}
            variant="contained"
            disabled={claiming}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {claiming ? 'Claiming...' : 'Confirm Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ItemCard;
