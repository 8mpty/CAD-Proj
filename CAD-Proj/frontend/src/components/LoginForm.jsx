import React, { useState } from 'react';
import { TextField, Button, Alert, Box } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { signIn, getCurrentUser } from 'aws-amplify/auth';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
   
    try {
      console.log('Attempting sign in...');
      const signInOutput = await signIn({
        username: formData.email,
        password: formData.password,
      });
     
      if (signInOutput.isSignedIn) {
        try {
          const currentUser = await getCurrentUser();  
          const userData = {
            email: formData.email,
            username: formData.email,
            sub: currentUser.userId
          };
          onLogin(userData);
        } catch (userError) {
          console.error('Error getting current user:', userError);
          setError('Error retrieving user information');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      switch(err.name) {
        case 'UserNotFoundException':
          setError('User not found');
          break;
        case 'NotAuthorizedException':
          setError('Incorrect email or password');
          break;
        case 'UserNotConfirmedException':
          setError('Please verify your email first');
          break;
        case 'AuthError':
          setError(err.message || 'Authentication failed');
          break;
        default:
          setError('Failed to login. Please try again.');
      }
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
        startIcon={<LoginIcon />}
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;