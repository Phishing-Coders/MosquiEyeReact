import { useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";

const DateRangePicker = ({ onDateChange, initialDateRange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const formatDateRange = () => {
    if (!startDate || !endDate) return format(new Date(), 'MMM dd, yyyy');
    if (startDate.getTime() === endDate.getTime()) {
      return format(startDate, 'MMM dd, yyyy');
    }
    return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
  };

  useEffect(() => {
    if (initialDateRange && initialDateRange[0] && initialDateRange[1]) {
      setStartDate(new Date(initialDateRange[0]));
      setEndDate(new Date(initialDateRange[1]));
      // Optionally, you can open the menu by default if needed
      // setAnchorEl(someElement);
    }
  }, [initialDateRange]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateChange = (newStartDate, newEndDate) => {
    if (newStartDate) {
      // Adjust for timezone when manually selecting dates
      const start = new Date(newStartDate);
      start.setHours(0, 0, 0, 0);
      setStartDate(start);
    }
    if (newEndDate) {
      const end = new Date(newEndDate);
      end.setHours(23, 59, 59, 999);
      setEndDate(end);
    }
    if (newStartDate && newEndDate) {
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const start = new Date(newStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(newEndDate);
      end.setHours(23, 59, 59, 999);
      
      // Adjust dates for timezone before sending to parent
      const adjustedStart = new Date(start.getTime() - tzOffset);
      const adjustedEnd = new Date(end.getTime() - tzOffset);
      
      onDateChange(adjustedStart, adjustedEnd);
    }
  };

  const handlePresetSelect = (preset) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    // Get local timezone offset in minutes
    const tzOffset = now.getTimezoneOffset() * 60000;

    switch(preset) {
      case 'today':
        // Set start to beginning of current day in local timezone
        start = new Date(new Date().setHours(0,0,0,0) - tzOffset);
        // Set end to end of current day in local timezone
        end = new Date(new Date().setHours(23,59,59,999) - tzOffset);
        break;
      case 'yesterday':
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        start = new Date(start.setHours(0,0,0,0) - tzOffset);
        end = new Date(start);
        end = new Date(end.setHours(23,59,59,999) - tzOffset);
        break;
      case 'thisWeek':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        break;
      case 'lastWeek':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setDate(now.getDate() - now.getDay() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'pastTwoWeeks':
        start = new Date(now);
        start.setDate(now.getDate() - 14);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastYear':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
    onDateChange(start, end);
    handleClose();
  };

  const CustomInput = ({ value, onClick }) => (
    <Button
      onClick={onClick}
      sx={{
        color: colors.grey[100],
        backgroundColor: colors.primary[400],
        '&:hover': { backgroundColor: colors.primary[300] },
        minWidth: '200px',
        justifyContent: 'flex-start'
      }}
    >
      {formatDateRange()}
    </Button>
  );

  return (
    <Box>
      <CustomInput onClick={handleClick} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorReference="none"
        slotProps={{
          paper: {
            style: {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }
          }
        }}
        PaperProps={{
          sx: {
            bgcolor: colors.primary[400],
            color: colors.grey[100],
            width: '600px', // Adjusted width
            padding: '32px', // Increased padding
            borderRadius: '8px' // Added border radius
          }
        }}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Top row - Date Pickers side by side */}
          <Box display="flex" gap={2} justifyContent="space-between" marginLeft={2} marginRight={2} marginTop={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newDate) => handleDateChange(newDate, endDate)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        backgroundColor: colors.primary[400],
                      },
                      "& .MuiPickersDay-root": {
                        color: colors.grey[100],
                        "&:hover": {
                          backgroundColor: colors.primary[500],
                        },
                        "&.Mui-selected": {
                          backgroundColor: colors.greenAccent[500],
                        },
                      },
                    },
                  },
                }}
                sx={{
                  flex: 1,
                  bgcolor: colors.primary[300],
                  '& .MuiInputBase-root': {
                    color: colors.grey[100],
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.grey[100],
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.grey[100],
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newDate) => handleDateChange(startDate, newDate)}
                minDate={startDate}
                
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        backgroundColor: colors.primary[400],
                      },
                      "& .MuiPickersDay-root": {
                        color: colors.grey[100],
                        "&:hover": {
                          backgroundColor: colors.primary[500],
                        },
                        "&.Mui-selected": {
                          backgroundColor: colors.greenAccent[500],
                        },
                      },
                    },
                  },
                }}
                sx={{
                  flex: 1,
                  bgcolor: colors.primary[300],
                  '& .MuiInputBase-root': {
                    color: colors.grey[100],
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.grey[100],
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.grey[100],
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Divider */}
          <Box 
            sx={{ 
              borderTop: `1px solid ${colors.grey[100]}`,
              my: 1
            }}
          />

          {/* Bottom section - Quick Select options */}
          <Box>
            <Typography variant="h6" marginLeft={2} sx={{ color: colors.grey[100], mb: 2 }}>
              Quick Select
            </Typography>
            <Box 
              display="flex" 
              flexWrap="wrap" 
              gap={1}
            >
              {[
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: 'This Week', value: 'thisWeek' },
                { label: 'Last Week', value: 'lastWeek' },
                { label: 'Past Two Weeks', value: 'pastTwoWeeks' },
                { label: 'This Month', value: 'thisMonth' },
                { label: 'Last Month', value: 'lastMonth' },
                { label: 'This Year', value: 'thisYear' },
                { label: 'Last Year', value: 'lastYear' }
              ].map(option => (
                <MenuItem 
                  key={option.value}
                  onClick={() => handlePresetSelect(option.value)}
                  sx={{
                    color: colors.grey[100],
                    backgroundColor: colors.primary[500], // Added background color
                    margin: '4px', // Added margin between items
                    borderRadius: '4px', // Added border radius
                    '&:hover': { 
                      backgroundColor: colors.primary[600] 
                    },
                    flex: '0 0 calc(33.33% - 16px)', // Adjusted for margin
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Box>
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};

export default DateRangePicker;
