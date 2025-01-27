import React from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';

const ReportItem = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted');
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report Found Item
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="Item Name"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Location Found"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="date"
            label="Date Found"
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={4}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Submit Report
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ReportItem;