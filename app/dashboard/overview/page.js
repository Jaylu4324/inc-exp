"use client";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "@/components/Sidebar";
import PrivateAuth from "@/components/PrivateAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function OverviewPage() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [filterType, setFilterType] = useState("day");
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [anchorElExport, setAnchorElExport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const incRes = await axios.get("/User/getIncome", { headers });
        const expRes = await axios.get("/User/getExpense", { headers });

        setIncomeData(incRes.data?.data?.Income || []);
        setExpenseData(expRes.data?.data?.Expense || []);
      } catch (err) {
        console.error("Error fetching overview data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const grouped = {};

    const process = (items, key) => {
      items.forEach((item) => {
        const date = new Date(item.Date);
        let groupKey = date.toLocaleDateString();
        if (filterType === "month") {
          groupKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        } else if (filterType === "year") {
          groupKey = `${date.getFullYear()}`;
        }

        if (!grouped[groupKey]) {
          grouped[groupKey] = { period: groupKey, income: 0, expense: 0, profit: 0 };
        }
        grouped[groupKey][key] += Number(item.Income || item.Expense || 0);
      });
    };

    process(incomeData, "income");
    process(expenseData, "expense");

    const result = Object.values(grouped).map((row) => ({
      ...row,
      profit: row.income - row.expense,
    }));

    setTableData(result);
    setChartData(result);
  }, [incomeData, expenseData, filterType]);

  const handleExportClick = (e) => setAnchorElExport(e.currentTarget);
  const handleExportClose = () => setAnchorElExport(null);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Overview");
    XLSX.writeFile(workbook, "Overview_Analytics.xlsx");
    handleExportClose();
  };

  return (
    <PrivateAuth>
      <Sidebar>
        <Box sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Analytics & Profit/Loss Overview
            </Typography>
            <Box>
              <Button variant="outlined" onClick={handleExportClick}>
                Export
              </Button>
              <Menu anchorEl={anchorElExport} open={Boolean(anchorElExport)} onClose={handleExportClose}>
                <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
              </Menu>
            </Box>
          </Box>

          <Tabs
            value={filterType}
            onChange={(e, val) => setFilterType(val)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Day" value="day" />
            <Tab label="Month" value="month" />
            <Tab label="Year" value="year" />
          </Tabs>

          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
              Profit / Loss Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#2e7d32" name="Income" />
                <Bar dataKey="expense" fill="#d32f2f" name="Expense" />
                <Bar dataKey="profit" fill="#1976d2" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><b>Period ({filterType.toUpperCase()})</b></TableCell>
                  <TableCell align="right"><b>Total Income (₹)</b></TableCell>
                  <TableCell align="right"><b>Total Expense (₹)</b></TableCell>
                  <TableCell align="right"><b>Net Profit / Loss (₹)</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.period}</TableCell>
                      <TableCell align="right" sx={{ color: '#2e7d32' }}>
                        ₹{row.income.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#d32f2f' }}>
                        ₹{row.expense.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: row.profit >= 0 ? '#2e7d32' : '#d32f2f' }}>
                        ₹{row.profit.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No overview data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Sidebar>
    </PrivateAuth>
  );
}
