// Create a new component: src/components/MobileContainer.jsx
import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const MobileContainer = ({ children }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  
  return (
    <Box 
      sx={{
        padding: isMobile ? "10px" : "20px",
        maxWidth: "100%",
        overflowX: "hidden"
      }}
    >
      {children}
    </Box>
  );
};