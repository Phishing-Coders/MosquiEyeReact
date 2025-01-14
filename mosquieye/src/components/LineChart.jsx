import { useEffect, useState, useCallback, useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ChartControls from "./ChartControls";

const LineChart = ({ 
  metrics,
  timeFrame,
  setTimeFrame,
  selectedMetrics,
  setSelectedMetrics,
  selectedMonths,
  setSelectedMonths,
  selectedYear,
  setSelectedYear,
  scanBy,
  setScanBy,
  groupBy,
  setGroupBy,
  onDateChange
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Helper functions first
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

  // States after helper functions
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });
  const [dateRange, setDateRange] = useState(getThisWeekRange());
  const [userNames, setUserNames] = useState({});

  // Helper functions from BarChart
  const handleDateChange = useCallback((start, end) => {
    if (start && end) {
      setDateRange({ startDate: start, endDate: end });
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
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();
        
        if (stats.timeSeriesData && stats.timeSeriesData.length > 0) {
          // Format data for line chart
          const formattedData = selectedMetrics.map(metric => ({
            id: metrics.find(m => m.value === metric)?.label || metric,
            data: stats.timeSeriesData.map(entry => ({
              x: entry.dimensionValue,
              y: Math.round(entry[metric] || 0)
            }))
          }));
          
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

  // Calculate summaries
  const calculateSummaries = useMemo(() => {
    if (!data.length) return [];
    
    return selectedMetrics.map(metric => {
      const metricData = data.find(d => d.id === metrics.find(m => m.value === metric)?.label)?.data || [];
      const values = metricData.map(d => d.y);
      const total = values.reduce((sum, val) => sum + (val || 0), 0);
      const avg = values.length ? total / values.length : 0;
      
      return {
        metric,
        label: metrics.find(m => m.value === metric)?.label || metric,
        total: Math.round(total),
        average: Math.round(avg * 100) / 100
      };
    });
  }, [data, selectedMetrics]);

  // Render loading and error states
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography color="error">{error}</Typography></Box>;

  const chartData = [
    {
      id: "Total Eggs",
      color: tokens("dark").greenAccent[500],
      data: Array.isArray(data) ? data : []
    }
  ];

  // Early return if no valid data
  if (!data || data.length === 0) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h6" color={colors.grey[100]}>
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      sx={{ 
        width: '100%',
        height: '100%',  // Changed from fixed height
        position: 'relative',
        overflow: 'visible'  // Changed from hidden
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ textAlign: 'center', padding: '20px', color: colors.grey[100] }}>
          Egg Distribution Statistics
        </Typography>
        <ChartControls
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          selectedMetrics={selectedMetrics}
          setSelectedMetrics={setSelectedMetrics}
          selectedMonths={setSelectedMonths}
          setSelectedMonths={setSelectedMonths}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          scanBy={scanBy}
          setScanBy={setScanBy}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          metrics={metrics}
          onDateChange={handleDateChange}
          initialDateRange={[dateRange.startDate, dateRange.endDate]}
        />
      </Box>

      {/* Summary boxes */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        {calculateSummaries.map(summary => (
          <Box key={summary.metric} bgcolor={colors.primary[400]} p={2} borderRadius={2} minWidth={200}>
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>{summary.label}</Typography>
            <Typography sx={{ color: colors.grey[100] }}>Total: {summary.total}</Typography>
            <Typography sx={{ color: colors.grey[100] }}>Average: {summary.average}</Typography>
          </Box>
        ))}
      </Box>

      {/* Chart container */}
      <Box 
        sx={{
          flex: 1,  // Changed from fixed height
          width: '100%',
          position: 'relative',
          minHeight: '500px',  // Added minimum height
          paddingBottom: '120px'  // Added padding for legend
        }}
      >
        {data.length > 0 ? (
          <ResponsiveLine
            data={data}
            margin={{ 
              top: 50, 
              right: 110, 
              bottom: 150,  // Increased bottom margin
              left: 60 
            }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: groupBy === 'date' ? 'Date' : groupBy,
              legendOffset: 36,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: "bottom",  // Changed to bottom
                direction: "row",  // Changed to row
                justify: false,
                translateY: 80,    // Moved legend down
                translateX: 0,
                itemsSpacing: 10,
                itemWidth: 100,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            theme={{
              axis: {
                domain: { line: { stroke: colors.grey[100] } },
                legend: { text: { fill: colors.grey[100] } },
                ticks: {
                  line: { stroke: colors.grey[100], strokeWidth: 1 },
                  text: { fill: colors.grey[100] }
                }
              },
              legends: { text: { fill: colors.grey[100] } },
              tooltip: { container: { color: colors.primary[500] } }
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

export default LineChart;
