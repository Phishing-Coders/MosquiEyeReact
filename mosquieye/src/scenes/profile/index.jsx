import {
    ArrowBack,
    CalendarToday,
    Check,
    Edit,
    HelpOutline,
    Home,
    Lock,
    Notifications,
    Person,
    Settings,
    ShowChart,
  } from "@mui/icons-material";
  import {
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography,
  } from "@mui/material";
  
import { useAuth } from '@clerk/clerk-react';
import axios from "axios";

import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
  
const Profile = () => {
  const { user } = useAuth();

  const saveUserDetails = async () => {
    try {
      const userDetails = {
        userId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      await axios.post("/api/user/saveUser", userDetails);
      alert("User details saved successfully");
    
    } catch (error) {
      console.error("Error saving user details", error);
      alert("Error saving user details");
    }
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

    return (
      <Box display="flex" justifyContent="center" width="100%" bgcolor="white">
        <Box width="1728px" height="1117px" position="relative">
          <Box
            width="120px"
            height="1117px"
            position="absolute"
            top={0}
            left={0}
            bgcolor="#ffc296"
          >
            <Avatar
              src="https://via.placeholder.com/65"
              alt="Logo"
              sx={{
                width: 65,
                height: 65,
                top: 31,
                left: 27,
                position: "absolute",
              }}
            />
            <List>
              <ListItem button>
                <ListItemIcon>
                  <Home fontSize="large" />
                </ListItemIcon>
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Notifications fontSize="large" />
                </ListItemIcon>
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <CalendarToday fontSize="large" />
                </ListItemIcon>
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <ShowChart fontSize="large" />
                </ListItemIcon>
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Person fontSize="large" />
                </ListItemIcon>
              </ListItem>
            </List>
            <Box
              width="81px"
              height="81px"
              position="absolute"
              top="1007px"
              left="19px"
              bgcolor="#ff6f08"
              borderRadius="50%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Settings fontSize="large" />
            </Box>
          </Box>
  
          <Box
            width="330px"
            height="1117px"
            position="absolute"
            top={0}
            left="134px"
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#1b1b1b"
              position="absolute"
              top="41px"
              left="72px"
            >
              settings
            </Typography>
            <IconButton sx={{ position: "absolute", top: "35px", left: 0 }}>
              <ArrowBack fontSize="large" />
            </IconButton>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <Edit fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary="Edit profile"
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    fontSize: "28px",
                    color: "#1b1b1b",
                  }}
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Notifications fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary="Notification"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                    fontSize: "28px",
                    color: "#848484",
                  }}
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Lock fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary="Security"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                    fontSize: "28px",
                    color: "#848484",
                  }}
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Settings fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary="Appearance"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                    fontSize: "28px",
                    color: "#848484",
                  }}
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <HelpOutline fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary="Help"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                    fontSize: "28px",
                    color: "#848484",
                  }}
                />
              </ListItem>
            </List>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ position: "absolute", top: 0, left: "328px" }}
            />
          </Box>
  
          <Box
            position="absolute"
            top="10px"
            left="1584px"
            display="flex"
            alignItems="center"
          >
            <Avatar
              src="https://via.placeholder.com/40"
              alt="User"
              sx={{ width: 40, height: 40, marginRight: 2 }}
            />
            <IconButton>
              <Notifications fontSize="large" />
            </IconButton>
          </Box>
  
          <Avatar
            src="https://via.placeholder.com/120"
            alt="User"
            sx={{
              width: 120,
              height: 120,
              position: "absolute",
              top: "60px",
              left: "1352px",
            }}
          />
  
          <Typography
            variant="h3"
            fontWeight="bold"
            color="black"
            position="absolute"
            top="82px"
            left="596px"
          >
            Edit profile
          </Typography>
  
          <Container>
            <Grid
              container
              spacing={3}
              sx={{ position: "absolute", top: "216px", left: "596px" }}
            >
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  defaultValue="Mehrab"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  defaultValue="Bozorgi"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue="Mehrabbozorgi.business@gmail.com"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <Check fontSize="large" sx={{ color: "#23b000" }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  defaultValue="33062 Zboncak isle"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  defaultValue="58077.79"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  defaultValue="Mehrab"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  select
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="Mehrab">Mehrab</option>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="State"
                  defaultValue="Bozorgi"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  select
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="Bozorgi">Bozorgi</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  defaultValue="sbdfbnd65sfdvb s"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <Check fontSize="large" sx={{ color: "#23b000" }} />
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Container>
  
          <Box
            position="absolute"
            top="1007px"
            left="593px"
            display="flex"
            gap={2}
          >
            <Button
              variant="outlined"
              color="warning"
              sx={{ width: "182px", height: "55px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              sx={{ width: "182px", height: "55px" }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    );
};
  
export default Profile;
  