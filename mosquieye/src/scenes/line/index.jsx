import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useCallback } from "react";
import ChartControls from "../../components/ChartControls";

const Line = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Add metrics array
  const metrics = [
    { value: 'singleEggs', label: 'Single Eggs' },
    { value: 'clusteredEggs', label: 'Cluster Eggs' },
    { value: 'totalEggs', label: 'Total Eggs' },
    { value: 'singlesTotalArea', label: 'Singles Total Area' },
    { value: 'singlesAvg', label: 'Singles Avg Size' },
    { value: 'clustersTotalArea', label: 'Clusters Total Area' },
    { value: 'avgClusterArea', label: 'Avg Cluster Area' },
    { value: 'avgEggsPerCluster', label: 'Avg Eggs per Cluster' }
  ];

  const [timeFrame, setTimeFrame] = useState('month');
  const [selectedMetrics, setSelectedMetrics] = useState(['singleEggs', 'clusteredEggs']);
  const [selectedMonths, setSelectedMonths] = useState([new Date().getMonth() + 1]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [scanBy, setScanBy] = useState("");
  const [groupBy, setGroupBy] = useState('date');

  const handleDateChange = useCallback((start, end) => {
    // Handle date changes
  }, []);

  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Simple Line Chart" />
      <Box 
        sx={{ 
          height: "300px ", // Adjust height to account for header and margins
          overflow: "visible"  // Allow overflow to be visible
        }}
      >
        <LineChart 
          metrics={metrics}
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          selectedMetrics={selectedMetrics}
          setSelectedMetrics={setSelectedMetrics}
          selectedMonths={selectedMonths}
          setSelectedMonths={setSelectedMonths}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          scanBy={scanBy}
          setScanBy={setScanBy}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          onDateChange={handleDateChange}
        />
      </Box>
    </Box>
  );
};

export default Line;
