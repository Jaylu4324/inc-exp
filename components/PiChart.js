"use client";
import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography, Box } from '@mui/material';

export default function PieActiveArc(props) {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    if (props.filteredArr && props.filteredArr.length > 0) {
      const filterPiChartData = props.filteredArr.map((ele, index) => ({
        label: ele["Category"] || `Item ${index + 1}`,
        id: index + 1,
        value: Number(ele[props.type]) || 0
      }));
      setData(filterPiChartData);
    } else {
      setData([]);
    }
  }, [props.filteredArr, props.update, props.type]);

  if (data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No data available for chart
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Typography variant="h6" align="center" sx={{ mb: 1 }}>
        {props.type} Distribution
      </Typography>
      <PieChart
        series={[
          {
            data,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          },
        ]}
        height={220}
      />
    </Box>
  );
}
