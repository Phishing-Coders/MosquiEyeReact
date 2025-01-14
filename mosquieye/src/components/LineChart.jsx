import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { mockLineData as data } from "../data/mockData";

const LineChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
    <ResponsiveLine
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100]
            }
          },
          legend: {
            text: {
              fill: colors.grey[100]
            }
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1
            },
            text: {
              fill: colors.grey[100]
            }
          }
        },
        legends: {
          text: {
            fill: colors.grey[100]
          }
        },
        tooltip: {
          container: {
            color: colors.primary[500]
          }
        }
      }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "0",
        max: "auto",
        stacked: false,
        reverse: false
      }}
      yFormat=" >-.0f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Day",
        legendOffset: 36,
        legendPosition: "middle"
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Egg Count",
        legendOffset: -50,
        legendPosition: "middle"
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1
              }
            }
          ]
        }
      ]}
    />
  );
};

export default LineChart;
