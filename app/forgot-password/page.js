"use client";
import React, { useState } from 'react';
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Alert
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter an email address.');
      setSeverity('error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/send-random-password', { email });
      setMessage(res.data.message || 'Password reset email sent!');
      setSeverity('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending password reset request.');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'black' }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Reset Password
        </Typography>
        {message && <Alert severity={severity} sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Registered Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, backgroundColor: 'black', color: 'white' }}
          >
            {loading ? 'Sending...' : 'Send Temporary Password'}
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/login" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
                Remember your password? Sign In
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
