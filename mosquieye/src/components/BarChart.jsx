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
    const fetchStats = async () => {
      try {
        const monthsQuery = selectedMonths.join(',');
        const scanByParam = scanBy ? `&scan_by=${scanBy}` : '';
        const response = await fetch(`/api/images/stats/aggregate?timeFrame=${timeFrame}&months=${monthsQuery}&year=${selectedYear}${scanByParam}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        
        if (stats.timeSeriesData && stats.timeSeriesData.length > 0) {
          const formattedData = stats.timeSeriesData
            .filter(entry => {
              const date = new Date(entry._id);
              const month = date.getMonth() + 1;
              return selectedMonths.includes(month);
            })
            .map(entry => {
              const date = new Date(entry._id);
              return {
                date: timeFrame === 'month' 
                  ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                ...Object.fromEntries(
                  selectedMetrics.map(metric => [
                    metric,
                    Math.round(entry[metric] || 0)
                  ])
                )
              };
            });
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
  }, [timeFrame, selectedMetrics, selectedMonths, selectedYear, scanBy]);

  // Generate random colors for selected metrics
  const generateRandomColors = useMemo(() => {
    return selectedMetrics.map(() => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 70 + Math.random() * 30; // 70-100%
      const lightness = 45 + Math.random() * 10; // 45-55%
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  }, [selectedMetrics]);

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
        height: '100%',
        minHeight: '500px'
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
        />
      </Box>

      {/* Summary box */}
      <Box display="flex" gap={2} mb={2}>
        <Box bgcolor={colors.primary[400]} p={2} borderRadius={2}>
          <Typography variant="h6" sx={{ color: colors.grey[100] }}>Total Eggs</Typography>
          <Typography sx={{ color: colors.grey[100] }}>{totalImages}</Typography>
        </Box>
        {/* ...add more summary cards as needed... */}
      </Box>
      
      <Box 
        sx={{
          flex: 1,
          height: calculateChartHeight(),
          position: 'relative',
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
              bottom: 100,  // Increased bottom margin
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
              }
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 45, // Angled date labels
              legend: 'Date',
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
                anchor: dimensions.width < 600 ? "bottom" : "bottom-right",
                direction: dimensions.width < 600 ? "row" : "column",
                justify: false,
                translateX: dimensions.width < 600 ? 0 : 120,
                translateY: dimensions.width < 600 ? 50 : 0,
                itemsSpacing: dimensions.width < 600 ? 10 : 2,
                itemWidth: dimensions.width < 600 ? 80 : 100,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 20,
              },
            ]}
            groupMode="grouped"
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
