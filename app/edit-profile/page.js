"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import PrivateAuth from '@/components/PrivateAuth';

export default function EditProfilePage() {
  const [data, setData] = useState({ Email: '', FirstName: '', LastName: '' });
  const [alert, setAlert] = useState('');
  const [type, setType] = useState('info');
  const [update, doUpdate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/User/findUser", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      if (res.data?.data) {
        setData(res.data.data);
      }
    }).catch(console.error);
  }, [update]);

  const handleSave = () => {
    const token = localStorage.getItem("token");
    axios.post("/User/updateUser", data, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      if (res.data.msg === "user upadeted success") {
        setAlert("Profile updated successfully!");
        setType("success");
        doUpdate(!update);
      }
    }).catch((err) => {
      console.error(err);
      setAlert("Failed to update profile.");
      setType("error");
    });
  };

  return (
    <PrivateAuth>
      <Sidebar>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }} align="center">
              Edit User Profile
            </Typography>

            {alert && <Alert severity={type} sx={{ mb: 3 }}>{alert}</Alert>}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  disabled
                  label="Email Address"
                  value={data.Email || ''}
                  variant="outlined"
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={data.FirstName || ''}
                  variant="outlined"
                  onChange={(e) => setData({ ...data, FirstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={data.LastName || ''}
                  variant="outlined"
                  onChange={(e) => setData({ ...data, LastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  sx={{ mt: 2, py: 1.5, backgroundColor: 'black', color: 'white' }}
                >
                  Save Profile Changes
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Sidebar>
    </PrivateAuth>
  );
}
