import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";
import { useState, useCallback } from "react";

const Pie = () => {
  // Get initial date range (current week)
  const getThisWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  };

  const [dateRange, setDateRange] = useState(getThisWeekRange());

  const handleDateChange = useCallback((start, end) => {
    setDateRange({ startDate: start, endDate: end });
  }, []);

  return (
    <Box 
      m="20px"
      display="flex"
      marginBottom={50}
      flexDirection="column"
      sx={{ 
        height: "100%",
        minHeight: "85vh",
        overflow: "visible"
      }}
    >
      <Header 
        title="Egg Distribution Analytics" 
        subtitle="Visual distribution of egg patterns in pie chart format" 
      />
      <Box flex="1">
        <PieChart initialDateRange={[dateRange.startDate, dateRange.endDate]} onDateChange={handleDateChange} />
      </Box>
    </Box>
  );
};

export default Pie;
