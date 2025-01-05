import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatBox = ({ title, subtitle, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" m="0 30px">
      <Box
        display="flex"
        alignItems="center"
        sx={{
          position: "relative",
          justifyContent: "center",
          minHeight: "40px",
        }}
      >
        {/* Icon on the left */}
        <Box sx={{ position: "absolute", left: 0 }}>
          {icon}
        </Box>

        {/* Vertical stack of title and subtitle */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="8px"
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: colors.grey[100],
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: colors.greenAccent[500],
              textAlign: "center",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatBox;
