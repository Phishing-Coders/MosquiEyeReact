import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { formatDate } from "@fullcalendar/core";

const CalendarSidebar = ({ currentEvents, colors, handleEventClick }) => {
  return (
    <Box
      flex="1 1 20%"
      bgcolor={colors.primary[400]}
      p="15px"
      borderRadius="4px"
      sx={{
        maxHeight: '75vh', // Set maximum height
        overflowY: 'auto',  // Enable vertical scrolling
      }}
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
              cursor: 'pointer', // Add cursor pointer
              display: 'flex', // Add flex display for alignment
              alignItems: 'center', // Center items vertically
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => handleEventClick({ event })} // Add click handler
          >
            {/* Add status dot */}
            <span className={event.extendedProps.status === 'done' ? 'status-dot-done' : 'status-dot-not-done'}></span>
            <ListItemText
              primary={
                <span style={{ color: '#000000' }}> {/* Set text color to black */}
                  {event.title}
                </span>
              }
              secondary={
                <Typography style={{ color: '#000000' }}> {/* Set date text color to black */}
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