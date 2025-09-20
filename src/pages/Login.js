import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { authService } from '../services/auth';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper className="farmville-card" sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🌱 Welcome Back!
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Email" 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            sx={{ mb: 2 }} 
          />
          <TextField 
            fullWidth 
            label="Password" 
            type="password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            sx={{ mb: 3 }} 
          />
          <Button type="submit" fullWidth variant="contained" size="large" className="farmville-button">
            Sign In
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;