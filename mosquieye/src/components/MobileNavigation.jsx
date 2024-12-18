import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ScannerIcon from "@mui/icons-material/Scanner";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { useUser } from '@clerk/clerk-react';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useUser();
  const userRole = user?.organizationMemberships?.[0]?.role;

  const navigationItems = [
    {
      label: "Home",
      icon: <HomeOutlinedIcon />,
      path: '/dashboard',
      roles: ["org:admin", "org:health_office"]
    },
    {
      label: "Scan",
      icon: <ScannerIcon />,
      path: '/scan',
      roles: ["org:admin", "org:health_office", "org:operations_team"]
    },
    {
      label: "QR Scan",
      icon: <ScannerIcon />,
      path: '/qrscan',
      roles: ["org:admin", "org:health_office", "org:operations_team"]
    },
    {
      label: "Calendar",
      icon: <BarChartIcon />,
      path: '/calendar',
      roles: ["org:admin", "org:health_office", "org:operations_team"]
    },
    {
      label: "Profile",
      icon: <PersonOutlinedIcon />,
      path: '/profile',
      roles: ["org:admin", "org:health_office", "org:operations_team"]
    }
  ];

  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const index = navigationItems.findIndex(item => item.path === currentPath);
    return index >= 0 ? index : 0;
  };

  const [value, setValue] = useState(getCurrentValue());

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: colors.primary[400],
        borderTop: `1px solid ${colors.primary[500]}`,
        zIndex: 1000,
        '& .MuiBottomNavigationAction-root': {
          color: colors.grey[300],
          '&.Mui-selected': {
            color: colors.greenAccent[500]
          }
        }
      }}
    >
      {navigationItems
        .filter(item => item.roles.includes(userRole))
        .map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            onClick={() => navigate(item.path)}
          />
        ))}
    </BottomNavigation>
  );
};

export default MobileNavigation;