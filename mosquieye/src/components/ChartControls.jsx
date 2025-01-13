import { Box, FormControl, InputLabel, MenuItem, Select, Chip } from '@mui/material';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { useState, useEffect } from 'react';

const ChartControls = ({ 
  timeFrame, 
  setTimeFrame, 
  selectedMetrics, 
  setSelectedMetrics, 
  selectedMonths, 
  setSelectedMonths,
  selectedYear,
  setSelectedYear,
  scanBy,
  setScanBy 
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [scanByUsers, setScanByUsers] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 5 },
    (_, i) => currentYear - 2 + i
  );

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Set all months as selected by default when timeFrame changes to 'year'
  useEffect(() => {
    if (timeFrame === 'year') {
      setSelectedMonths(months.map(m => m.value));
    } else {
      setSelectedMonths([new Date().getMonth() + 1]); // Current month for 'month' view
    }
  }, [timeFrame]);

  const metrics = [
    { value: 'singleEggs', label: 'Single Eggs (avg)' },
    { value: 'clusteredEggs', label: 'Clustered Eggs (avg)' },
    { value: 'totalEggs', label: 'Total Eggs (avg)' },
    { value: 'clustersCount', label: 'Clusters Count (avg)' },
    { value: 'avgEggsPerCluster', label: 'Avg Eggs per Cluster' },
  ];

  // Add useEffect to fetch scan-by users
  useEffect(() => {
    const fetchScanByUsers = async () => {
      try {
        const response = await fetch('/api/images/scan-by/users');
        const data = await response.json();
        setScanByUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching scan-by users:', error);
      }
    };
    fetchScanByUsers();
  }, []);

  return (
    <Box display="flex" gap={2} mb={2}>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel sx={{ color: colors.grey[100] }}>Time Frame</InputLabel>
        <Select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          label="Time Frame"
          sx={{
            color: colors.grey[100],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.grey[100]
            }
          }}
        >
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="week">Week</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel sx={{ color: colors.grey[100] }}>Year</InputLabel>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          label="Year"
          sx={{
            color: colors.grey[100],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.grey[100]
            }
          }}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel sx={{ color: colors.grey[100] }}>
          {timeFrame === 'year' ? 'Select Months' : 'Select Month'}
        </InputLabel>
        <Select
          multiple={timeFrame === 'year'}
          value={selectedMonths}
          onChange={(e) => setSelectedMonths(timeFrame === 'year' ? e.target.value : [e.target.value])}
          label={timeFrame === 'year' ? 'Select Months' : 'Select Month'}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {Array.isArray(selected) ? selected.map((value) => (
                <Chip 
                  key={value} 
                  label={months.find(m => m.value === value)?.label} 
                  sx={{ 
                    color: colors.grey[100],
                    backgroundColor: colors.primary[400]
                  }}
                />
              )) : (
                <Chip 
                  label={months.find(m => m.value === selected)?.label}
                  sx={{ 
                    color: colors.grey[100],
                    backgroundColor: colors.primary[400]
                  }}
                />
              )}
            </Box>
          )}
          sx={{
            color: colors.grey[100],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.grey[100]
            }
          }}
        >
          {months.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel sx={{ color: colors.grey[100] }}>Metrics</InputLabel>
        <Select
          multiple
          value={selectedMetrics}
          onChange={(e) => setSelectedMetrics(e.target.value)}
          label="Metrics"
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip 
                  key={value} 
                  label={metrics.find(m => m.value === value)?.label} 
                  sx={{ 
                    color: colors.grey[100],
                    backgroundColor: colors.primary[400]
                  }}
                />
              ))}
            </Box>
          )}
          sx={{
            color: colors.grey[100],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.grey[100]
            }
          }}
        >
          {metrics.map((metric) => (
            <MenuItem key={metric.value} value={metric.value}>
              {metric.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel sx={{ color: colors.grey[100] }}>Scan By</InputLabel>
        <Select
          value={scanBy}
          onChange={(e) => setScanBy(e.target.value)}
          label="Scan By"
          sx={{
            color: colors.grey[100],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.grey[100]
            }
          }}
        >
          <MenuItem value="">(All)</MenuItem>
          {scanByUsers.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.fullName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ChartControls;
