"use client";
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import * as XLSX from 'xlsx';
import Sidebar from '@/components/Sidebar';
import PrivateAuth from '@/components/PrivateAuth';
import PiChart from '@/components/PiChart';

export default function ExpensePage() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [arr, setArr] = useState([]);
  const [filteredArr, setFilteredArr] = useState([]);
  const [formData, setFormData] = useState({});
  const [update, setUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorElExport, setAnchorElExport] = useState(null);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData({});
  };

  const handleExportClick = (event) => setAnchorElExport(event.currentTarget);
  const handleExportClose = () => setAnchorElExport(null);

  const fetchExpense = () => {
    const token = localStorage.getItem("token");
    axios.get("/User/getExpense", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const data = res.data?.data?.Expense || [];
      setArr(data);
      setFilteredArr(data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchExpense();
  }, [update]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    if (editId) {
      axios.post(`/User/updateExpense?id=${editId}`, { arr: { ...formData } }, { headers })
        .then(() => setUpdate(!update))
        .catch(console.error);
    } else {
      axios.post("/User/Expense", { arr: { ...formData, Date: formData.Date || new Date().toLocaleDateString() } }, { headers })
        .then(() => setUpdate(!update))
        .catch(console.error);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
    axios.delete(`/User/deleteExpense?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => setUpdate(!update))
      .catch(console.error);
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData(row);
    setOpen(true);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredArr(arr);
    } else {
      const filtered = arr.filter((row) =>
        (row.Category && row.Category.toLowerCase().includes(term.toLowerCase())) ||
        (row.Description && row.Description.toLowerCase().includes(term.toLowerCase())) ||
        (row.Expense && String(row.Expense).includes(term))
      );
      setFilteredArr(filtered);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredArr);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense");
    XLSX.writeFile(workbook, "Expense_Data.xlsx");
    handleExportClose();
  };

  return (
    <PrivateAuth>
      <Sidebar>
        <Box sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Expense Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                onClick={handleClickOpen}
                sx={{ backgroundColor: 'black', color: 'white', mr: 2 }}
              >
                Add Expense
              </Button>
              <Button variant="outlined" onClick={handleExportClick}>
                Export
              </Button>
              <Menu anchorEl={anchorElExport} open={Boolean(anchorElExport)} onClose={handleExportClose}>
                <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <PiChart filteredArr={filteredArr} type="Expense" update={update} />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Search Expense Records"
                value={searchTerm}
                onChange={handleSearch}
                variant="outlined"
                placeholder="Search by category, description, amount..."
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Expense (₹)</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Description</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredArr.length > 0 ? (
                  filteredArr.map((row, idx) => (
                    <TableRow key={row.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row.Date}</TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 600 }}>
                        ₹{Number(row.Expense || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{row.Category}</TableCell>
                      <TableCell>{row.Description}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleEdit(row)} sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(row.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No expense records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
              <DialogTitle>{editId ? "Edit" : "Add"} Expense Details</DialogTitle>
              <DialogContent>
                <TextField
                  margin="dense"
                  id="Date"
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={formData.Date || ''}
                  onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                  sx={{ mb: 2, mt: 1 }}
                />
                <TextField
                  margin="dense"
                  id="Expense"
                  label="Expense Amount"
                  type="number"
                  fullWidth
                  required
                  variant="outlined"
                  value={formData.Expense || ''}
                  onChange={(e) => setFormData({ ...formData, Expense: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  id="Category"
                  label="Category"
                  type="text"
                  fullWidth
                  required
                  variant="outlined"
                  value={formData.Category || ''}
                  onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  id="Description"
                  label="Description"
                  type="text"
                  fullWidth
                  required
                  variant="outlined"
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                />
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ backgroundColor: 'black', color: 'white' }}>
                  {editId ? "Update" : "Add"}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </Sidebar>
    </PrivateAuth>
  );
}
