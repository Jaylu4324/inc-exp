"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Sidebar from "@/components/Sidebar";
import PrivateAuth from "@/components/PrivateAuth";
import axios from "axios";
import Graph from "@/components/Graph";

function SummaryCard({ title, value, color, icon }) {
  return (
    <Card
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ fontSize: '32px', my: 2 }}>
        {icon}
      </Box>
      <Typography variant="h5" component="div" fontWeight="600" color={color}>
        ₹{parseInt(value || 0).toLocaleString('en-IN')}
      </Typography>
    </Card>
  );
}

export default function DashboardPage() {
  const [incomeTotal, setIncomeTotal] = React.useState(0);
  const [expenseTotal, setExpenseTotal] = React.useState(0);

  React.useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const expenseResponse = await axios.get("/User/getExpense", { headers });
        if (expenseResponse.data?.data?.Expense) {
          const expenseData = expenseResponse.data.data.Expense;
          const total = expenseData.reduce((sum, item) => sum + (parseInt(item.Expense) || 0), 0);
          setExpenseTotal(total);
        }

        const incomeResponse = await axios.get("/User/getIncome", { headers });
        if (incomeResponse.data?.data?.Income) {
          const incomeData = incomeResponse.data.data.Income;
          const total = incomeData.reduce((sum, item) => sum + (parseInt(item.Income) || 0), 0);
          setIncomeTotal(total);
        }
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchSummaryData();
  }, []);

  const balance = incomeTotal - expenseTotal;

  return (
    <PrivateAuth>
      <Sidebar>
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Financial Overview
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="Total Income"
                value={incomeTotal}
                color="#2e7d32"
                icon="💰"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="Total Expense"
                value={expenseTotal}
                color="#d32f2f"
                icon="💸"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="Net Balance"
                value={balance}
                color={balance >= 0 ? "#1976d2" : "#d32f2f"}
                icon="⚖️"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Graph Title="Income" Url="/User/getIncome" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Graph Title="Expense" Url="/User/getExpense" />
            </Grid>
          </Grid>
        </Box>
      </Sidebar>
    </PrivateAuth>
  );
}
