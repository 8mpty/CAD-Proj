import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Chip,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

const CATEGORIES = [
  "Electronics",
  "Jewelry",
  "Clothing",
  "Documents",
  "Keys",
  "Other",
];

const ReportItem = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const steps = ["Upload Image", "Review AI Analysis", "Submit Report"];

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.size > 8 * 1024 * 1024) {
      setError("File size must be less than 8MB");
      return;
    }
    setSelectedFile(file);
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    await analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`http://${import.meta.env.VITE_AWS_URL}:3001/api/analyze-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setAiSuggestions(data);
      if (data.suggestedCategory) {
        setCategory(data.suggestedCategory);
      }
      setActiveStep(1);
    } catch (err) {
      setError("Failed to analyze image: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("name", event.target.itemName.value);
    formData.append("location", event.target.location.value);
    formData.append("dateFound", event.target.dateFound.value);
    formData.append("description", event.target.description.value);
    formData.append("category", category);

    // Add AI labels if they exist
    if (aiSuggestions?.labels) {
      formData.append("aiLabels", JSON.stringify(aiSuggestions.labels));
    }

    try {
      const response = await fetch(`http://${import.meta.env.VITE_AWS_URL}:3001/api/items`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit item");
      }

      setSuccess(true);
      setActiveStep(3); // Move to completion
      event.target.reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setAiSuggestions(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUploadStep = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Button variant="contained" component="label" size="large">
        Upload Image
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
      {loading && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress />
          <Typography>Analyzing image...</Typography>
        </Box>
      )}
    </Box>
  );

  const renderAiAnalysisStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Image Preview
          </Typography>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "4px",
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            AI Analysis Results
          </Typography>
          {aiSuggestions?.labels && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Detected Objects:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {aiSuggestions.labels.map((label, index) => (
                  <Chip
                    key={index}
                    label={`${label.name} (${label.confidence}%)`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                Suggested Category: {aiSuggestions.suggestedCategory}
              </Typography>
            </>
          )}
          <Button
            variant="contained"
            onClick={() => setActiveStep(2)}
            sx={{ mt: 2 }}
          >
            Continue to Report
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderReportForm = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        name="itemName"
        label="Item Name"
        margin="normal"
        required
      />
      <TextField
        fullWidth
        select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        margin="normal"
        required
        helperText={`AI Suggested Category: ${aiSuggestions?.suggestedCategory}`}
      >
        {CATEGORIES.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        name="location"
        label="Location Found"
        margin="normal"
        required
      />
      <TextField
        fullWidth
        name="dateFound"
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
        name="description"
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
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Submit Report"}
      </Button>
    </Box>
  );

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report Found Item
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Item successfully reported! Notifications will be sent to subscribed
            users.
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && renderUploadStep()}
        {activeStep === 1 && renderAiAnalysisStep()}
        {activeStep === 2 && renderReportForm()}
      </Box>
    </Container>
  );
};

export default ReportItem;
