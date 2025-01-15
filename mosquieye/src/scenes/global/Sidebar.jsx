import React from "react"; // Import React
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link, useLocation } from "react-router-dom"; // Import necessary hooks
import "react-pro-sidebar/dist/css/styles.css";
import { useState, useEffect } from "react"; // Import useState and useEffect
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import AddLocationOutlinedIcon from '@mui/icons-material/AddLocationOutlined';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CompareIcon from '@mui/icons-material/Compare';
import QrCodeIcon from "@mui/icons-material/QrCode";
import { useUser } from '@clerk/clerk-react';

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.primary[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Link to={to}>
        <Typography 
          sx={{ 
            color: theme.palette.mode === 'dark' 
              ? colors.grey[100] 
              : colors.primary[100] // Change to black in light mode
          }}
        >
          {title}
        </Typography>
      </Link>
    </MenuItem>
  );
};


const menuConfig = [
  {
    category: 'Main',
    items: [
      {
        title: "Dashboard",
        to: "/dashboard",
        icon: <HomeOutlinedIcon />,
        permissions: ["org:health_office", "org:operations_team"]
      }
    ]
  },
  {
    category: 'Data',
    items: [
      {
        title: "Manage Team",
        to: "/team",
        icon: <PeopleOutlinedIcon />,
        permissions: ["org:health_office"]
      },
      // {
      //   title: "Contacts Information",
      //   to: "/contacts",
      //   icon: <ContactsOutlinedIcon />,
      //   permissions: ["org:health_office", "org:operations_team"]
      // },
      {
        title: "Ovitrap Management",
        to: "/ovitrap",
        icon: <AddLocationOutlinedIcon />,
        permissions: ["org:health_office"]
      }
    ]
  },
  {
    category: 'Pages',
    items: [
      {
        title: "Scan",
        to: "/scan",
        icon: <CompareIcon />,
        permissions: ["org:health_office", "org:operations_team"]
      },
      {
        title: "QR Scan",
        to: "/qrscan",
        icon: <QrCodeIcon />,
        permissions: ["org:health_office", "org:operations_team"]
      },
      {
        title: "Calendar",
        to: "/calendar",
        icon: <CalendarTodayOutlinedIcon />,
        permissions: ["org:health_office", "org:operations_team"]
      },
      {
        title: "Map",
        to: "/maps",
        icon: <MapOutlinedIcon />,
        permissions: ["org:health_office", "org:operations_team"]
      },
      {
        title: "Analysis History",
        to: "/analysisHistory",
        icon: <TimelineOutlinedIcon />,
        permissions: ["org:health_office", "org:operations_team"]
      }
    ]
  },
  // {
  //   category: 'Charts',
  //   items: [
  //     {
  //       title: "Bar Chart",
  //       to: "/bar",
  //       icon: <BarChartOutlinedIcon />,
  //       permissions: ["org:health_office"]
  //     },
  //     {
  //       title: "Pie Chart",
  //       to: "/pie",
  //       icon: <PieChartOutlineOutlinedIcon />,
  //       permissions: ["org:health_office"]
  //     },
  //     {
  //       title: "Line Chart",
  //       to: "/line",
  //       icon: <TimelineOutlinedIcon />,
  //       permissions: ["org:health_office"]
  //     },
  //     {
  //       title: "Geography Chart",
  //       to: "/geography",
  //       icon: <MapOutlinedIcon />,
  //       permissions: ["org:health_office"]
  //     }
  // ]
  // }
];
const Sidebar = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { isSignedIn, user, isLoaded } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const location = useLocation();

  const userRole = user?.organizationMemberships?.[0]?.role;
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
    } else if (path === "/scan") {
      setSelected("Scan");
    } else if (path === "/qrscan") { // Add this line if you have a specific route for QR scan
      setSelected("QR Scan");
    }
  }, [location.pathname]); // Re-run this effect whenever the route changes

  // Don't render sidebar on mobile
  if (isMobile) {
    return null;
  }

  if (!isLoaded) {
    return null;
  }

  // Don't show the sidebar when on the login page
  if (location.pathname === "/") {
    return null; // Don't render the sidebar if on the login page
  }

  const hasPermission = (permissions) => {
    if (userRole === "org:admin") {
      return true;
    }

    return permissions.includes(userRole);
  };

  const renderMenuItems = (items) => {
    return items
      .filter(item => hasPermission(item.permissions))
      .map(item => (
        <Item
          key={item.title}
          title={item.title}
          to={item.to}
          icon={item.icon}
          selected={selected}
          setSelected={setSelected}
        />
      ));
  };

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  MOSQUIEYE
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb={isMobile ? "15px" : "25px"}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width={isMobile ? "80px" : "100px"}
                  height={isMobile ? "80px" : "100px"}
                  src={user.imageUrl || "https://via.placeholder.com/120"}
                  style={{ 
                    cursor: "pointer", 
                    borderRadius: "50%",
                    padding: isMobile ? "5px" : "0"
                  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant={isMobile ? "h3" : "h2"}
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: isMobile ? "5px 0 0 0" : "10px 0 0 0" }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color={colors.greenAccent[500]}
                >
                  {userRole?.replace('org:', '').split('_').map(
                    word => word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Typography>
              </Box>
            </Box>
          )}

          
            <Box paddingLeft={isCollapsed ? undefined : "10%"}>
              {menuConfig.map(({ category, items }) => {
                const filteredItems = items.filter(item => 
                  hasPermission(item.permissions)
                );
                
                if (filteredItems.length === 0) return null;

                return (
                  <React.Fragment key={category}>
                    <Typography
                      variant="h6"
                      color={colors.primary[100]}
                      sx={{ m: "15px 0 5px 20px" }}
                    >
                      {category}
                    </Typography>
                    {renderMenuItems(filteredItems)}
                  </React.Fragment>
                );
              })}
          </Box>
          {

          }
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
