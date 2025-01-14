import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import axios from "axios";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { OrganizationSwitcher } from '@clerk/clerk-react';

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/all');
        const usersWithId = response.data.map((user, index) => ({
          rowNumber: index + 1,
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          access: user.role,
          ...user
        }));
        setUsers(usersWithId);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    {
      field: "rowNumber",
      headerName: "#",
      width: 50,
      sortable: false,
    },
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        const accessLabel = access === 'org:admin' ? 'Admin' : 'Operations Team';
        return (
          <Box
            width="50%"
            m="4px auto"
            p="10px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              access === 'org:admin' ? colors.greenAccent[600] : colors.blueAccent[600]
            }
            borderRadius="4px"
          >
            {access === 'org:admin' && <AdminPanelSettingsOutlinedIcon />}
            {access === 'org:operations_team' && <SecurityOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: 1 }}>
              {accessLabel}
            </Typography>
            {/* <OrganizationSwitcher /> */}
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      <OrganizationSwitcher
        hidePersonal={true} />
      <Box
        m="20px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            fontSize: "15px",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.primary[400]} !important`,
          },
        }}
      >
        {users.length > 0 ? (
          <DataGrid rows={users} columns={columns} />
        ) : (
          <Typography variant="h6" color={colors.grey[100]}>
            No users found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Team;