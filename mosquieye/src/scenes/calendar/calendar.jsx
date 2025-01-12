import { useState, useRef, useEffect } from "react"; // Add useEffect import
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
// import listPlugin from "@fullcalendar/list"; // Commented out to disable List view
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
import { Margin } from "@mui/icons-material";
import './CalendarStyles.css';
import { useUser } from '@clerk/clerk-react'; // Add this import

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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Add this state
  const { user } = useUser(); // Add this line to get the user object
  const [ovitraps, setOvitraps] = useState([]); // Add this state

  // Add this useEffect to fetch schedules when component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get('/api/schedules');
        const formattedEvents = formatSchedulesToEvents(response.data.schedules); // Use helper function
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        alert('Failed to load schedules');
      }
    };

    fetchSchedules();
    // Cleanup subscription on unmount
    return () => {
      setEvents([]);
      setCurrentEvents([]);
    };
  }, []);

  // Add this useEffect to fetch ovitraps
  useEffect(() => {
    const fetchOvitraps = async () => {
      try {
        const response = await api.get('/api/ovitraps');
        setOvitraps(response.data.ovitraps);
      } catch (error) {
        console.error('Error fetching ovitraps:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching ovitraps',
          severity: 'error'
        });
      }
    };

    fetchOvitraps();
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

  function toLocalDateString(dateObj) {
    // Format date as 'YYYY-MM-DD' based on local timezone
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleEventClick = (selected) => {
    if (selected.event) {
      // First, close any open popover by clicking the close button
      closeMorePopover();

      // Then set the selected event and form data
      setSelectedEvent(selected.event);
      const startDate = new Date(selected.event.start);
      const endDate = selected.event.end ? new Date(selected.event.end) : null;

      // Subtract the extra day if it was a full-day event in the calendar
      if (selected.event.extendedProps.isFullDay && selected.event.extendedProps.type === 'range' && endDate) {
        endDate.setDate(endDate.getDate() - 1);
      } else if (selected.event.extendedProps.isFullDay && !selected.event.extendedProps.type.includes('range') && endDate) {
        // Single full-day event
        endDate.setDate(endDate.getDate());
      }

      const formattedStartDate = toLocalDateString(startDate);
      const formattedEndDate = endDate ? toLocalDateString(endDate) : "";

      const formattedStartTime =
        selected.event.extendedProps.startTime || startDate.toTimeString().slice(0, 5);
      const formattedEndTime =
        selected.event.extendedProps.endTime || "";

      setIsRange(selected.event.extendedProps.type === 'range');
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

  // Add helper function for formatting events
  const formatSchedulesToEvents = (schedules) => {
    return schedules.map(schedule => {
      const startDateObj = new Date(schedule.startDate);
      const endDateObj = schedule.endDate ? new Date(schedule.endDate) : null;
      let endDateString;
  
      if (schedule.isFullDay) {
        // For all-day events, display end date with +1 day in FullCalendar
        if (schedule.type === 'range' && endDateObj) {
          const temp = new Date(endDateObj);
          temp.setDate(temp.getDate() + 1);
          endDateString = temp.toISOString().split('T')[0] + 'T00:00';
        } else {
          // Single full-day => same day 23:59, no extra day
          endDateString = startDateObj.toISOString().split('T')[0] + 'T23:59';
        }
      } else {
        // Non-full-day
        if (schedule.type === 'range' && endDateObj) {
          endDateString = endDateObj.toISOString().split('T')[0] + 'T' + schedule.endTime;
        } else {
          endDateString = startDateObj.toISOString().split('T')[0] + 'T' + schedule.endTime;
        }
      }
  
      return {
        id: schedule._id,
        title: schedule.task,
        allDay: schedule.isFullDay,
        start: startDateObj.toISOString().split('T')[0] + 'T' + schedule.startTime,
        end: endDateString,
        extendedProps: {
          ovitrap: schedule.ovitrap_id,
          status: schedule.status,
          type: schedule.type,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isFullDay: schedule.isFullDay
        }
      };
    });
  };

  // Update handleFormSubmit to use the new helper
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
  
      // First fetch the MongoDB user ID
      const userResponse = await api.get(`/api/users/clerk/${user.id}`);
      const mongoUserId = userResponse.data.user._id;
  
      const submitData = {
        ovitrap_id: formData.ovitrap,
        schedule_by: mongoUserId, // Use MongoDB _id instead of Clerk ID
        type: isRange ? 'range' : 'single',
        startDate: formData.startDate,
        endDate: isRange ? formData.endDate : null,
        startTime: isFullDay ? "00:00" : formData.startTime,
        endTime: isFullDay ? "23:59" : formData.endTime,
        isFullDay: isFullDay,
        task: formData.name,
        status: formData.status
      };
  
      const response = selectedEvent
        ? await api.put(`/api/schedules/${selectedEvent.id}`, submitData)
        : await api.post('/api/schedules', submitData);
  
      setSnackbar({
        open: true,
        message: `Event ${selectedEvent ? 'updated' : 'created'} successfully`,
        severity: 'success'
      });
  
      // Refresh events
      const updatedResponse = await api.get('/api/schedules');
      setEvents(formatSchedulesToEvents(updatedResponse.data.schedules));
      handleCloseDialog();
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

  const handleDelete = async () => {
    try {
      if (!selectedEvent) {
        return;
      }

      await api.delete(`/api/schedules/${selectedEvent.id}`);
      
      // Refresh events after deletion
      const updatedResponse = await api.get('/api/schedules');
      const formattedEvents = updatedResponse.data.schedules.map(schedule => ({
        id: schedule._id,
        title: schedule.task,
        allDay: schedule.isFullDay,
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

      setSnackbar({
        open: true,
        message: 'Event deleted successfully',
        severity: 'success'
      });

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
      console.error('Error deleting event:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting event: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const handleEventDrop = async (dropInfo) => {
    const event = dropInfo.event;
    const updatedStartDate = event.startStr.split('T')[0];
    let updatedEndDate = event.end ? event.endStr.split('T')[0] : null;
  
    const updateData = {
      startDate: updatedStartDate,
      isFullDay: event.allDay,
      status: event.extendedProps.status,
      ovitrap: event.extendedProps.ovitrap,
      type: event.extendedProps.type, // Include the event type
    };
  
    if (event.extendedProps.type === 'range') {
      if (event.allDay && updatedEndDate) {
        // Subtract one day for full-day range events to keep endDate inclusive
        const endDateObj = new Date(updatedEndDate);
        endDateObj.setDate(endDateObj.getDate() - 1);
        updatedEndDate = endDateObj.toISOString().split('T')[0];
        updateData.endDate = updatedEndDate;
      } else {
        updateData.endDate = updatedEndDate;
      }
    } else {
      updateData.endDate = null;
    }
  
    try {
      await api.put(`/api/schedules/${event.id}`, updateData);
      // Refresh events after successful update
      const response = await api.get('/api/schedules');
      const formattedEvents = formatSchedulesToEvents(response.data.schedules);
      setEvents(formattedEvents);
      setSnackbar({
        open: true,
        message: 'Event updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating event:', error);
      setSnackbar({
        open: true,
        message: 'Error updating event: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      // Revert the change in the calendar UI
      dropInfo.revert();
    }
  };
  
  // Add this function to handle date set
  const handleDatesSet = (dateInfo) => {
    const month = dateInfo.view.currentStart.getMonth(); // 0-indexed
    setCurrentMonth(month);
  };

  // Filter events based on currentMonth
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.getMonth() === currentMonth;
  }).sort((a, b) => new Date(a.start) - new Date(b.start)); // Sort ascending

  return (
    <Box m="20px">
      <Header title="Calendar" />
      <Box display="flex" justifyContent="space-between">
        <CalendarSidebar 
          currentEvents={filteredEvents} // Update this prop
          colors={colors} 
          handleEventClick={handleEventClick}  // Pass the handler
        />
        <Box flex="1 1 100%" ml="15px">
          <StyledCalendarWrapper>
            <FullCalendar
              ref={calendarRef} // Add this ref
              height="75vh"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                // listPlugin, // Commented out to disable List view
              ]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay" // Removed "listMonth"
                // right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth", // Original line
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={false} // Remove or set to false
              dayMaxEventRows={2} // Show 2 events before showing "more" link
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
                // Determine the status dot class based on event status
                const statusClass = eventInfo.event.extendedProps.status === 'done'
                  ? 'status-dot-done'
                  : 'status-dot-not-done';
              
                // Create the status dot element
                const statusDot = <span className={statusClass}></span>;
              
                // Construct the event title with the status dot
                const title = eventInfo.event.extendedProps.isFullDay
                  ? eventInfo.event.title
                  : `${eventInfo.timeText} ${eventInfo.event.title}`;
              
                return (
                  <>
                    {eventInfo.event.extendedProps.status && statusDot}
                    <span>{title}</span>
                  </>
                );
              }}
              fixedWeekCount={false}  // Add this line to hide extra week rows
              eventOrder={(a, b) => {
                const statusA = a.extendedProps.status;
                const statusB = b.extendedProps.status;
            
                if (statusA === statusB) return 0;
                if (statusA === 'not done') return -1;
                if (statusB === 'not done') return 1;
                return 0;
              }}
              eventDrop={handleEventDrop} // Add this line
              datesSet={handleDatesSet} // Add this prop
              // eventDidMount={(info) => { // Commented out to disable List view styling
              //   if (info.view.type.startsWith('list')) {
              //     if (info.event.extendedProps.status === 'done') {
              //       info.el.classList.add('fc-event-done');
              //     } else {
              //       info.el.classList.add('fc-event-not-done');
              //     }
              //   }
              // }}
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
        handleDelete={handleDelete}
        ovitraps={ovitraps} // Pass ovitraps to EventDialog
      />
    </Box>
  );
};

export default Calendar;
