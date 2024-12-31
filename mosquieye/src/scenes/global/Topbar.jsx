import { useState, useEffect } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";;
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useClerk, UserButton } from "@clerk/clerk-react";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [selected, setSelected] = useState("Dashboard");
  const { logout } = useAuth();
  const { signOut } = useClerk();

  const location = useLocation(); // Get current location (URL) from react-router

  const navigate = useNavigate(); // Get the navigate function from react-router

  useEffect(() => {
    // Update the selected state based on the current path
    const path = location.pathname;
    if (path === "/dashboard") {
      setSelected("Dashboard");
    } else if (path === "/team") {
      setSelected("Manage Team");
    } else if (path === "/contacts") {
      setSelected("Contacts Information");
    } else if (path === "/ovitrap") {
      setSelected("Ovitrap Management");
    } else if (path === "/form") {
      setSelected("Profile Form");
    } else if (path === "/calendar") {
      setSelected("Calendar");
    } else if (path === "/faq") {
      setSelected("FAQ Page");
    } else if (path === "/bar") {
      setSelected("Bar Chart");
    } else if (path === "/pie") {
      setSelected("Pie Chart");
    } else if (path === "/line") {
      setSelected("Line Chart");
    } else if (path === "/geography") {
      setSelected("Geography Chart");
    } else if (path === "/profile") {
      setSelected("Profile");
    } else if (path === "/maps") {
      setSelected("Maps");
    }
  }, [location]); // Re-run this effect whenever the route changes

  // Don't show the sidebar when on the login page
  if (location.pathname === "/") {
    return null; // Don't render the sidebar if on the login page
  }

  return (
    <Box display="flex" justifyContent="flex-end" p={2}>
      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton >
          <UserButton />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
