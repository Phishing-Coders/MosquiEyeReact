import { useState, useEffect } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useClerk } from "@clerk/clerk-react";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [selected, setSelected] = useState("Dashboard");
  const { logout } = useAuth();
  const { signOut } = useClerk();

  const location = useLocation(); // Get current location (URL) from react-router

  useEffect(() => {
    // Update the selected state based on the current path
    const path = location.pathname;
    if (path === "/dashboard") {
      setSelected("Dashboard");
    } else if (path === "/team") {
      setSelected("Manage Team");
    } else if (path === "/contacts") {
      setSelected("Contacts Information");
    } else if (path === "/invoices") {
      setSelected("Invoices Balances");
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
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton onClick={() => window.location.href = "/maps"}>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={() => window.location.href = "/profile"}>
          <PersonOutlinedIcon />
        </IconButton>
        
        {/* Logout Button with Door Icon */}
        <IconButton onClick={() => signOut()}>
          <ExitToAppIcon /> {/* Door icon for logout */}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
