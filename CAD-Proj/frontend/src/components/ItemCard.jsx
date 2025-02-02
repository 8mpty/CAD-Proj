import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";

const ItemCard = ({ item, onClaimSuccess }) => {
  const [imageError, setImageError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClaimClick = () => {
    setOpenDialog(true);
  };

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
    <>
      <Card
        sx={{
          maxWidth: 345,
          m: 2,
          opacity: item.claimed_status ? 0.7 : 1,
          position: "relative",
        }}
      >
        {item.claimed_status && (
          <Chip
            label="CLAIMED"
            color="primary"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
            }}
          />
        )}
        <CardMedia
          component="img"
          height="200"
          image={imageError ? "/placeholder-image.jpg" : item.image_url}
          onError={handleImageError}
          alt={item.name}
          sx={{
            objectFit: "cover",
            bgcolor: "grey.200",
            filter: item.claimed_status ? "grayscale(100%)" : "none",
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {item.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Location Found: {item.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date Found: {new Date(item.date_found).toLocaleDateString()}
          </Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Description: {item.description}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClaimClick}
              disabled={item.claimed_status}
              fullWidth
            >
              {item.claimed_status ? "Already Claimed" : "Claim Item"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Claim</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to claim this item?
            <br />
            Item: {item.name}
            <br />
            Category: {item.category}
            <br />
            Location: {item.location}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleClaimConfirm}
            variant="contained"
            color="primary"
            disabled={claiming}
          >
            Confirm Claim
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ItemCard;
