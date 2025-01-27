import React, { useState } from 'react';
import { TextField, Button, Alert, Box } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        onRegister(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        label="Username"
        variant="outlined"
        margin="normal"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
          },
        }}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        variant="outlined"
        margin="normal"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
          },
        }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
          },
        }}
      />
      <Button 
        type="submit"
        variant="contained" 
        fullWidth
        sx={{
          mt: 3,
          mb: 2,
          height: '3.5rem',
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
          }
        }}
        startIcon={<PersonAddIcon />}
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;