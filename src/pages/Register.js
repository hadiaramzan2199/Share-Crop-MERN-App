import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import { authService } from '../services/auth';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    user_type: 'farmer', 
    address: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(formData);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper className="farmville-card" sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🌱 Join Share Crop!
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Full Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            sx={{ mb: 2 }} 
          />
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
            sx={{ mb: 2 }} 
          />
          <TextField 
            fullWidth 
            select
            label="I am a"
            value={formData.user_type}
            onChange={(e) => setFormData({...formData, user_type: e.target.value})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="farmer">Farmer</MenuItem>
            <MenuItem value="buyer">Buyer</MenuItem>
          </TextField>
          <TextField 
            fullWidth 
            label="Address" 
            multiline
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            sx={{ mb: 3 }} 
          />
          <Button type="submit" fullWidth variant="contained" size="large" className="farmville-button">
            Create Account
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;