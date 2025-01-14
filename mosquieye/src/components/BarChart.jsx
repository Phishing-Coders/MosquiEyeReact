import { useEffect, useState, useCallback, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ChartControls from "./ChartControls";

const BarChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });

  const [timeFrame, setTimeFrame] = useState('month');
  const [selectedMetrics, setSelectedMetrics] = useState(['singleEggs', 'clusteredEggs']);
  const [selectedMonths, setSelectedMonths] = useState([new Date().getMonth() + 1]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [scanBy, setScanBy] = useState("");
  const [groupBy, setGroupBy] = useState('date');
  const [userNames, setUserNames] = useState({});

  // Function to get start and end of the current week (Sunday to Saturday)
  const getThisWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { startDate: start, endDate: end };
  };

  // Initialize dateRange with "This Week"
  const [dateRange, setDateRange] = useState(getThisWeekRange());

  // Add metrics array at component level
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

  // Handle window resize
  const handleResize = useCallback(() => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth
    });
  }, []);

  // Add resize listener
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (groupBy === 'scan_by') {
        try {
          const response = await fetch('/api/images/scan-by/users');
          const data = await response.json();
          const nameMap = {};
          data.users.forEach(user => {
            nameMap[user._id] = user.fullName;
          });
          setUserNames(nameMap);
        } catch (error) {
          console.error('Error fetching user names:', error);
        }
      }
    };
    fetchUserNames();
  }, [groupBy]);

  const handleDateChange = useCallback((start, end) => {
    console.log('Date range changed:', { start, end });
    if (start && end) {
      setDateRange({
        startDate: start,
        endDate: end
      });
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!dateRange.startDate || !dateRange.endDate) return;
        
        setLoading(true);
        const startDateStr = dateRange.startDate.toISOString();
        const endDateStr = dateRange.endDate.toISOString();
        const scanByParam = scanBy ? `&scan_by=${scanBy}` : '';
        const groupByParam = groupBy ? `&groupBy=${groupBy}` : '';
        
        const url = `/api/images/stats/aggregate?startDate=${startDateStr}&endDate=${endDateStr}${scanByParam}${groupByParam}`;
        console.log('Fetching stats with URL:', url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        
        if (stats.timeSeriesData && stats.timeSeriesData.length > 0) {
          const formattedData = stats.timeSeriesData.map(entry => ({
            date: groupBy === 'scan_by' 
              ? userNames[entry.dimensionValue] || entry.dimensionValue
              : entry.dimensionValue,
            ...Object.fromEntries(
              selectedMetrics.map(metric => [
                metric,
                Math.round(entry[metric] || 0)
              ])
            )
          }));
          
          console.log('Formatted data:', formattedData); // Debug log
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, selectedMetrics, scanBy, groupBy, userNames]);

  // Generate random colors for selected metrics
  const generateRandomColors = useMemo(() => {
    return selectedMetrics.map(() => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 70 + Math.random() * 30; // 70-100%
      const lightness = 45 + Math.random() * 10; // 45-55%
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  }, [selectedMetrics]);

  // Calculate summary data for each selected metric
  const calculateSummaries = useMemo(() => {
    if (!data.length) return [];
    
    return selectedMetrics.map(metric => {
      const total = data.reduce((sum, d) => sum + (d[metric] || 0), 0);
      const avg = total / data.length;
      return {
        metric,
        label: metrics.find(m => m.value === metric)?.label || metric,
        total: Math.round(total),
        average: Math.round(avg * 100) / 100
      };
    });
  }, [data, selectedMetrics]);

  // Determine axis label based on groupBy
  const getAxisLabel = () => {
    switch(groupBy) {
      case 'ovitrap': return 'Ovitrap ID';
      case 'type': return 'Image Type';
      case 'scan_by': return 'Scanned By';
      default: return 'Date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Calculate chart height based on window size
  const calculateChartHeight = () => {
    return Math.max(500, dimensions.height * 0.6); // Ensures minimum height of 500px
  };

  // Example summary data:
  const totalImages = data.length ? data.reduce((sum, d) => sum + (d.totalEggs || 0), 0) : 0;

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      sx={{ 
        width: '100%',
        height: '800px',  // Set fixed height
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'center',
            padding: '20px',
            color: colors.grey[100]
          }}
        >
          Egg Distribution Statistics
        </Typography>
        <ChartControls
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
          metrics={metrics}
          onDateChange={handleDateChange}
          initialDateRange={[dateRange.startDate, dateRange.endDate]} // Add this prop
        />
      </Box>

      {/* Dynamic Summary boxes */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        {calculateSummaries.map(summary => (
          <Box 
            key={summary.metric}
            bgcolor={colors.primary[400]} 
            p={2} 
            borderRadius={2}
            minWidth={200}
          >
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>
              {summary.label}
            </Typography>
            <Typography sx={{ color: colors.grey[100] }}>
              Total: {summary.total}
            </Typography>
            <Typography sx={{ color: colors.grey[100] }}>
              Average: {summary.average}
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Box 
        sx={{
          height: '700px',  // Increased height
          width: '100%',
          position: 'relative',
          marginBottom: '100px', // Add bottom margin
          '& > div': {
            position: 'absolute',
            width: '100%',
            height: '100% !important'
          }
        }}
      >
        {data.length > 0 ? (
          <ResponsiveBar
            data={data}
            keys={selectedMetrics}
            indexBy="date"
            margin={{ 
              top: 50, 
              right: 130, 
              bottom: 150,  // Increased bottom margin
              left: 60 
            }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors={generateRandomColors}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            theme={{
              legends: {
                text: {
                  fill: colors.grey[100]
                }
              },
              axis: {
                ticks: {
                  text: {
                    fill: colors.grey[100]
                  }
                },
                legend: {
                  text: {
                    fill: colors.grey[100]
                  }
                }
              },
              tooltip: {
                container: {
                  color: '#000000'  // Set tooltip text color to black
                }
              }
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0, // Angled date labels
              legend: getAxisLabel(), // Use dynamic label
              legendPosition: 'middle',
              legendOffset: 50
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateY: 100,   // Increased translateY
                translateX: 0,
                itemsSpacing: 20,  // Increased spacing between items
                itemWidth: 120,    // Increased item width
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 20,
              },
            ]}
            groupMode="grouped"
            tooltip={({ indexValue }) => {
              const dataPoint = data.find(d => d.date === indexValue);
              if (!dataPoint) return null;
              
              return (
                <div
                  style={{
                    padding: 12,
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <strong>{indexValue}</strong>
                  {selectedMetrics.map(metric => (
                    <div key={metric}>
                      <strong style={{ color: generateRandomColors[selectedMetrics.indexOf(metric)] }}>
                        {metrics.find(m => m.value === metric)?.label || metric}: 
                      </strong> {dataPoint[metric]}
                    </div>
                  ))}
                </div>
              );
            }}
            onMouseMove={(data, event) => {
              // This enables tooltip to show on axis hover
              if (!data) return;
            }}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" >
            <Typography color={colors.grey[100]}>No data available</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BarChart;
