import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";

const Bar = () => {
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
        subtitle="Visual representation of egg distribution patterns from scanned images" 
      />
      <Box flex="1">
        <BarChart />
      </Box>
    </Box>
  );
};

export default Bar;
