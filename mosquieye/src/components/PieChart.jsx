import { useEffect, useState, useCallback, useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ChartControls from "./ChartControls";

const PieChart = ({ initialDateRange, onDateChange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Helper functions first
  const getThisWeekRange = () => {
    // ... same as BarChart ...
  };

  // States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: initialDateRange ? new Date(initialDateRange[0]) : new Date(),
    endDate: initialDateRange ? new Date(initialDateRange[1]) : new Date()
  });
  const [selectedMetrics, setSelectedMetrics] = useState(['singleEggs', 'clusteredEggs']);
  const [scanBy, setScanBy] = useState("");
  const [groupBy, setGroupBy] = useState('date');
  const [userNames, setUserNames] = useState({});
  const [category, setCategory] = useState('type'); // 'type', 'ovitrap', or 'scan_by'

  // Metrics array
  const metrics = [
    { value: 'totalEggs', label: 'Total Eggs' },
    { value: 'singleEggs', label: 'Single Eggs' },
    { value: 'clusteredEggs', label: 'Cluster Eggs' },
    { value: 'singlesTotalArea', label: 'Singles Affected Area' },
    { value: 'clustersTotalArea', label: 'Clusters Affected Area' }
  ];

  const categoryOptions = [
    { value: 'type', label: 'Image Type' },
    { value: 'ovitrap', label: 'Ovitrap ID' },
    { value: 'scan_by', label: 'Scan By' }
  ];

  const handleDateChange = useCallback((start, end) => {
    setDateRange({ startDate: start, endDate: end });
    onDateChange?.(start, end);
  }, [onDateChange]);

  // Data fetching effect
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!dateRange.startDate || !dateRange.endDate) return;
        
        setLoading(true);
        const startDateStr = dateRange.startDate.toISOString();
        const endDateStr = dateRange.endDate.toISOString();
        const scanByParam = scanBy ? `&scan_by=${scanBy}` : '';
        const groupByParam = groupBy ? `&groupBy=${groupBy}` : '';
        
        const url = `/api/images/stats/aggregate?startDate=${startDateStr}&endDate=${endDateStr}&groupBy=${category}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();
        
        if (stats.timeSeriesData && stats.timeSeriesData.length > 0) {
          // Format data for pie chart
          const aggregatedData = selectedMetrics.map(metric => {
            const total = stats.timeSeriesData.reduce(
              (sum, entry) => sum + (entry[metric] || 0), 
              0
            );
            return {
              id: metrics.find(m => m.value === metric)?.label || metric,
              label: metrics.find(m => m.value === metric)?.label || metric,
              value: Math.round(total)
            };
          });
          
          setData(aggregatedData);
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
  }, [dateRange, selectedMetrics, category]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography color="error">{error}</Typography></Box>;

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      sx={{ 
        width: '100%',
        height: '800px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ color: colors.grey[100] }}>
          Egg Distribution Statistics
        </Typography>
        <ChartControls
          selectedMetrics={selectedMetrics}
          setSelectedMetrics={setSelectedMetrics}
          scanBy={scanBy}
          setScanBy={setScanBy}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          metrics={metrics}
          onDateChange={handleDateChange}
          initialDateRange={[dateRange.startDate, dateRange.endDate]}
          category={category}
          setCategory={setCategory}
          categoryOptions={categoryOptions}
        />
      </Box>

      <Box 
        sx={{
          height: '700px',
          width: '100%',
          position: 'relative',
        }}
      >
        {data.length > 0 ? (
          <ResponsivePie
            data={data}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={colors.grey[100]}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={colors.grey[100]}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateY: 56,
                itemsSpacing: 20,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: colors.grey[100], // Fixed syntax error here
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: colors.grey[200]
                    }
                  }
                ]
              }
            ]}
            tooltip={({ datum }) => {
              // Calculate total value for percentage
              const total = data.reduce((sum, item) => sum + item.value, 0);
              const percentage = (datum.value / total) * 100;
              
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
                  <strong>{datum.id}</strong>
                  <br />
                  <strong style={{ color: datum.color }}>
                    Value: 
                  </strong> {datum.value}
                  <br />
                  <strong style={{ color: datum.color }}>
                    Percentage: 
                  </strong> {`${percentage.toFixed(1)}%`}
                </div>
              );
            }}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color={colors.grey[100]}>No data available</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PieChart;
