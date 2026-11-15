"use client";
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from "@mui/material/Alert";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [data, setData] = React.useState({});
  const [alert, setAlert] = React.useState();
  const [type, setType] = React.useState();
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post("/User/Login", data)
      .then((res) => {
        if (res.data.msg === "Login Success") {
          localStorage.setItem("token", res.data.token);
          setAlert("Login Success. Redirecting...");
          setType("success");
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else if (res.data.msg) {
          setAlert(res.data.msg);
          setType("error");
        }
      })
      .catch((err) => {
        console.error(err);
        setAlert("Login failed. Check credentials.");
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
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'black' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          Sign In
        </Typography>
        {alert && <Alert severity={type} sx={{ width: '100%', mb: 2 }}>{alert}</Alert>}
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={(e) => handleChange(e, "Email")}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => handleChange(e, "Password")}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: "black", color: "white" }}
          >
            Sign In
          </Button>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link href="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
                Forgot Password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
