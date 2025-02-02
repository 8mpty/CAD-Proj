import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  MenuItem,
  Chip,
  Grid,
} from "@mui/material";

const CATEGORIES = [
  "Electronics",
  "Jewelry",
  "Clothing",
  "Documents",
  "Keys",
  "Other",
];

const NotificationSubscription = () => {
  const [email, setEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (email) {
      fetchSubscriptions();
    }
  }, [email]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_AWS_URL}:3001/api/subscriptions/${email}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.map((sub) => sub.category));
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://${import.meta.env.VITE_AWS_URL}:3001/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus({
        type: "success",
        message: data.message,
      });
      setSelectedCategory("");
      fetchSubscriptions();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    }
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notification Subscriptions
        </Typography>
        <Typography color="text.secondary" paragraph>
          Subscribe to receive email notifications when new items are found in
          your categories of interest.
        </Typography>

        {status.message && (
          <Alert severity={status.type} sx={{ mb: 3 }}>
            {status.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                helperText="You will receive a confirmation email to verify your subscription"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                helperText="Select a category to receive notifications for"
              >
                {CATEGORIES.map((category) => (
                  <MenuItem
                    key={category}
                    value={category}
                    disabled={subscriptions.includes(category)}
                  >
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={!email || !selectedCategory}
              >
                Subscribe
              </Button>
            </Grid>
          </Grid>
        </Box>

        {subscriptions.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Active Subscriptions
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {subscriptions.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationSubscription;