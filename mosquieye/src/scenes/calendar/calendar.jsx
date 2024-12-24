import { useState, useRef, useEffect } from "react"; // Add useEffect import
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { formatDate } from "@fullcalendar/core"; // Import formatDate from @fullcalendar/core
import {
  Box,List,ListItem,ListItemText,Typography,useTheme,Dialog,DialogTitle,DialogContent,TextField,FormControl,InputLabel,Select,MenuItem,DialogActions,Button,Radio,RadioGroup,FormControlLabel,FormLabel,Alert,Snackbar,Grid 
} from "@mui/material";
import { styled } from '@mui/material/styles'; // Add styled import
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios'; // Ensure axios is imported
import Tooltip from '@mui/material/Tooltip'; // Ensure Tooltip is imported
import CalendarSidebar from "./CalendarSidebar";
import EventDialog from "./EventDialog";

// Add axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000' // Update this to match your backend URL
});

// Add custom styles for FullCalendar
const StyledCalendarWrapper = styled('div')(({ theme }) => ({
  '.fc-more-popover': {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    '& .fc-popover-header': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      padding: '8px',
    },
    '& .fc-popover-body': {
      padding: '8px',
    }
  },
  '.fc-daygrid-more-link': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '2px 4px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  },
  '.fc-event': {
    backgroundColor: '#1976d2', // Change to blue
    borderColor: '#1565c0', // Slightly darker blue for border
    '& .fc-content': {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 4px',
    },
    '& .fc-event-title, & .fc-event-time': {
      color: '#000000',
      display: 'inline',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  }
}));

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRange, setIsRange] = useState(false);
  const [isFullDay, setIsFullDay] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "", // Add startTime
    endTime: "",   // Add endTime
    name: "",
    ovitrap: "Ovitrap 1", // Set default ovitrap
    status: "not done",
  });
  const calendarRef = useRef(null); // Add this ref
  const [events, setEvents] = useState([]); // Add this state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add this useEffect to fetch schedules when component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get('/api/schedules');
        const formattedEvents = response.data.schedules.map(schedule => ({
          id: schedule._id,
          title: schedule.task,
          allDay: schedule.isFullDay, // Add this line to handle full day display
          start: `${schedule.startDate.split('T')[0]}T${schedule.startTime || '00:00'}`,
          end: schedule.type === 'range'
            ? `${schedule.endDate.split('T')[0]}T${schedule.endTime || '00:00'}`
            : null,
          extendedProps: {
            ovitrap: schedule.ovitrap_id,
            status: schedule.status,
            type: schedule.type,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isFullDay: schedule.isFullDay
          }
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        alert('Failed to load schedules');
      }
    };

    fetchSchedules();
  }, []);

  // Add new handler for date clicks
  const handleDateSelect = (selectInfo) => {
    setSelectedEvent(null);
    
    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Check if it's a date range selection
    const startDate = new Date(selectInfo.startStr);
    const endDate = selectInfo.endStr ? new Date(selectInfo.endStr) : null;
    
    if (endDate) {
      endDate.setDate(endDate.getDate() - 1);
    }

    // Check if this is a range selection
    const isRangeSelection = endDate && startDate.toDateString() !== endDate.toDateString();
    setIsRange(isRangeSelection);

    // Format dates for the form
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';

    // Set form data
    setIsFullDay(false); // Reset full day option
    setFormData({
      ...formData,
      startDate: formattedStartDate,
      endDate: isRangeSelection ? formattedEndDate : "",
      startTime: isFullDay ? "00:00" : currentTime,
      endTime: isFullDay ? "23:59" : currentTime,
      name: "",
      status: "not done",
    });

    setOpenDialog(true);
  };

  // Add handler for single date clicks
  const handleDateClick = (arg) => {
    setSelectedEvent(null);
    
    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Use arg.dateStr directly
    const formattedDate = arg.dateStr;

    // Set as single date event
    setIsRange(false);
    setFormData({
      ...formData,
      startDate: formattedDate,
      endDate: "",
      startTime: currentTime,
      endTime: currentTime,
      name: "",
      status: "not done",
    });

    setOpenDialog(true);
  };

  const closeMorePopover = () => {
    const popover = document.querySelector('.fc-popover');
    if (popover) {
      const closeButton = popover.querySelector('.fc-popover-close');
      if (closeButton) {
        closeButton.click();
      } else {
        // Fallback: remove popover if close button not found
        popover.parentElement.removeChild(popover);
      }
    }
  };

  const handleEventClick = (selected) => {
    if (selected.event) {
      // First, close any open popover by clicking the close button
      closeMorePopover();

      // Then set the selected event and form data
      setSelectedEvent(selected.event);
      const startDate = new Date(selected.event.start);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      let formattedEndDate = "";
      if (selected.event.end) {
        const endDate = new Date(selected.event.end);
        formattedEndDate = endDate.toISOString().split('T')[0];
      }

      const formattedStartTime =
        selected.event.extendedProps.startTime || startDate.toTimeString().slice(0, 5);
      const formattedEndTime =
        selected.event.extendedProps.endTime || "";

      setIsRange(!!selected.event.end);
      setIsFullDay(selected.event.extendedProps.isFullDay || false);
      setFormData({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        name: selected.event.title,
        ovitrap: selected.event.extendedProps.ovitrap || "",
        status: selected.event.extendedProps.status || "not done",
      });

      // Open the dialog after ensuring popover is closed
      setTimeout(() => {
        setOpenDialog(true);
      }, 10);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async () => {
    try {
      if (!formData.name || !formData.ovitrap) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      const submitData = {
        ovitrap_id: formData.ovitrap,
        schedule_by: "65a0c5d8d9e6c48c0d972b14",
        type: isRange ? 'range' : 'single',
        startDate: formData.startDate,
        endDate: isRange ? formData.endDate : null,
        startTime: isFullDay ? "00:00" : formData.startTime,
        endTime: isFullDay ? "23:59" : formData.endTime,
        isFullDay: isFullDay,
        task: formData.name,
        status: formData.status
      };

      if (selectedEvent) {
        // Update existing event
        const response = await api.put(`/api/schedules/${selectedEvent.id}`, submitData);
        setSnackbar({
          open: true,
          message: 'Event updated successfully',
          severity: 'success'
        });
      } else {
        // Create new event
        const response = await api.post('/api/schedules', submitData);
        setSnackbar({
          open: true,
          message: 'Event created successfully',
          severity: 'success'
        });
      }

      // Refresh events
      const updatedResponse = await api.get('/api/schedules');
      const formattedEvents = updatedResponse.data.schedules.map(schedule => ({
        id: schedule._id,
        title: schedule.task,
        start: `${schedule.startDate.split('T')[0]}T${schedule.startTime || '00:00'}`,
        end: schedule.type === 'range'
          ? `${schedule.endDate.split('T')[0]}T${schedule.endTime || '00:00'}`
          : null,
        extendedProps: {
          ovitrap: schedule.ovitrap_id,
          status: schedule.status,
          type: schedule.type,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isFullDay: schedule.isFullDay
        }
      }));
      setEvents(formattedEvents);

      // Close dialog and reset form
      handleCloseDialog();
      setSelectedEvent(null);
      setIsFullDay(false);
      setFormData({
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        name: "",
        ovitrap: "Ovitrap 1",
        status: "not done"
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message: 'Error creating event: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Add handleSnackbarClose
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Add a function to assign class names based on event status
  const eventClassNames = (arg) => {
    return arg.event.extendedProps.status === 'done' ? 'fc-event-done' : '';
  };

  // Add cleanup when dialog closes
  const handleCloseDialog = () => {
    closeMorePopover();
    setOpenDialog(false);
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />
      <Box display="flex" justifyContent="space-between">
        <CalendarSidebar currentEvents={currentEvents} colors={colors} />
        <Box flex="1 1 100%" ml="15px">
          <StyledCalendarWrapper>
            <FullCalendar
              ref={calendarRef} // Add this ref
              height="75vh"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              select={handleDateSelect} // For drag selection
              dateClick={handleDateClick} // Add this for single date clicks
              eventClick={handleEventClick}
              eventsSet={(events) => setCurrentEvents(events)}
              events={events} // Add this prop
              initialEvents={[]} // Remove or empty the initial events
              moreLinkClick="popover" // Add this prop
              moreLinkContent={({ num }) => `+${num} more`} // Optional: customize the "more" link text
              dayCellClassNames={(arg) => 
                arg.isPast ? 'past-day' : ''
              } // Optional: customize day cell styling
              eventClassNames={eventClassNames} // Add this line
              selectMinDistance={1} // Add this to help with drag selection
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              displayEventTime={true}
              displayEventEnd={true}
              eventContent={(eventInfo) => {
                if (eventInfo.event.extendedProps.isFullDay) {
                  return (
                    <div className="fc-content">
                      <div className="fc-title">{eventInfo.event.title}</div>
                    </div>
                  );
                }
                return (
                  <div className="fc-content">
                    <span className="fc-event-time">{eventInfo.timeText}</span>
                    <span className="fc-event-title">{eventInfo.event.title}</span>
                  </div>
                );
              }}
            />
          </StyledCalendarWrapper>
        </Box>
      </Box>
      <EventDialog
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        selectedEvent={selectedEvent}
        isRange={isRange}
        setIsRange={setIsRange}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        snackbar={snackbar}
        handleSnackbarClose={handleSnackbarClose}
        closeMorePopover={closeMorePopover}
        isFullDay={isFullDay}
        setIsFullDay={setIsFullDay}
      />
    </Box>
  );
};

export default Calendar;
