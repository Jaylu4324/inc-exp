"use client";
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from "@mui/material/Alert";
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [data, setData] = React.useState({});
  const [alert, setAlert] = React.useState();
  const [type, setType] = React.useState();
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post("/User/Register", data)
      .then((res) => {
        if (res.data.msg === "data Added") {
          setAlert("User Registered Successfully");
          setType("success");
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else if (res.data.msg) {
          setAlert(res.data.msg);
          setType("error");
        }
      })
      .catch((err) => {
        console.error(err);
        setAlert("Registration failed. Please check inputs.");
        setType("error");
      });
  };

  const handleChange = (e, field) => {
    setData({ ...data, [field]: e.target.value });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'black' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          Sign Up
        </Typography>
        {alert && <Alert severity={type} sx={{ width: '100%', mb: 2 }}>{alert}</Alert>}
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                onChange={(e) => handleChange(e, "FirstName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                onChange={(e) => handleChange(e, "LastName")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={(e) => handleChange(e, "Email")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                onChange={(e) => handleChange(e, "Password")}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: "black", color: "white" }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
