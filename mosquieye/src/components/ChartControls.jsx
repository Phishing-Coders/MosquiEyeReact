import { Box, FormControl, InputLabel, MenuItem, Select, Chip } from '@mui/material';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';

const ChartControls = ({ 
  selectedMetrics, 
  setSelectedMetrics,
  scanBy,
  setScanBy,
  groupBy,
  setGroupBy,
  metrics,
  initialDateRange,
  onDateChange,
  category,
  setCategory,
  categoryOptions = [] // Add default empty array
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

  // Common styles for Select components
  const selectStyles = {
    color: colors.grey[100],
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.grey[100]
    },
    '& .MuiSelect-select': {
      color: colors.grey[100]
    },
    '& .MuiMenuItem-root': {
      '&.Mui-selected': {
        backgroundColor: `${colors.primary[400]} !important`,
        color: colors.grey[100]
      },
      '&:hover': {
        backgroundColor: colors.primary[500]
      }
    }
  };

  // Common styles for MenuItems
  const menuItemStyles = {
    color: colors.grey[100],
    '&.Mui-selected': {
      backgroundColor: colors.primary[400],
      '&:hover': {
        backgroundColor: colors.primary[500]
      }
    },
    '&:hover': {
      backgroundColor: colors.primary[500]
    }
  };

  return (
    <Box>
      {/* Top row with date picker */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <DateRangePicker 
          onDateChange={onDateChange} 
          initialDateRange={initialDateRange}
        />
      </Box>

      {/* Bottom row with other controls */}
      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: colors.grey[100] }}>Group By</InputLabel>
          <Select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value || 'date')} // If blank, default to 'date'
            label="Group By"
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colors.primary[400],
                  '& .MuiMenuItem-root': menuItemStyles
                }
              }
            }}
          >
            <MenuItem value="">(No grouping)</MenuItem>
            <MenuItem value="ovitrap">Ovitrap ID</MenuItem>
            <MenuItem value="type">Image Type</MenuItem>
            <MenuItem value="scan_by">Scan By</MenuItem>
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
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colors.primary[400],
                  '& .MuiMenuItem-root': menuItemStyles
                }
              }
            }}
          >
            {metrics.map((metric) => (
              <MenuItem 
                key={metric.value} 
                value={metric.value}
                sx={menuItemStyles}
              >
                {metric.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {groupBy !== 'scan_by' && (
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: colors.grey[100] }}>Scan By</InputLabel>
            <Select
              value={scanBy}
              onChange={(e) => setScanBy(e.target.value)}
              label="Scan By"
              sx={selectStyles}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: colors.primary[400],
                    '& .MuiMenuItem-root': menuItemStyles
                  }
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
        )}

        {/* Only render category selection if categoryOptions is provided */}
        {categoryOptions.length > 0 && (
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: colors.grey[100] }}>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
              sx={selectStyles}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: colors.primary[400],
                    '& .MuiMenuItem-root': menuItemStyles
                  }
                }
              }}
            >
              {categoryOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: colors.grey[100] }}>Value Type</InputLabel>
          <Select
            value={selectedMetrics[0]} // Pie chart only uses one metric
            onChange={(e) => setSelectedMetrics([e.target.value])}
            label="Value Type"
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colors.primary[400],
                  '& .MuiMenuItem-root': menuItemStyles
                }
              }
            }}
          >
            {metrics.map(metric => (
              <MenuItem key={metric.value} value={metric.value}>
                {metric.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default ChartControls;
