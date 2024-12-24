
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { formatDate } from "@fullcalendar/core";

const CalendarSidebar = ({ currentEvents, colors }) => {
  return (
    <Box
      flex="1 1 20%"
      bgcolor={colors.primary[400]}
      p="15px"
      borderRadius="4px"
    >
      <Typography variant="h5">Events</Typography>
      <List>
        {currentEvents.map((event) => (
          <ListItem
            key={event.id}
            sx={{
              backgroundColor: colors.greenAccent[500],
              margin: "10px 0",
              borderRadius: "2px",
            }}
          >
            <ListItemText
              primary={event.title}
              secondary={
                <Typography>
                  {formatDate(event.start, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CalendarSidebar;