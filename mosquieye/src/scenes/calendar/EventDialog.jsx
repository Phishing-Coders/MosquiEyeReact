import {
  Dialog as MuiDialog, DialogTitle, DialogContent, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, TextField, Grid, Select, MenuItem, InputLabel,
  DialogActions, Button, Snackbar, Alert, Checkbox, Box, Typography
} from "@mui/material";
import { useState } from "react";

export const renderEventContent = (eventInfo) => {
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
};

const EventDialog = ({
  openDialog, handleCloseDialog, selectedEvent, isRange, setIsRange,
  formData, handleInputChange, handleFormSubmit, snackbar, handleSnackbarClose,
  closeMorePopover, isFullDay, setIsFullDay, handleDelete, ovitraps
}) => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });

  const handleConfirmAction = (action, title, message) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  return (
    <>
      <MuiDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onClick={() => closeMorePopover()}
        PaperProps={{
          style: {
            width: '600px',    // Increased width
            height: '500px',   // Decreased height
            overflow: 'hidden' // Ensure no scrolling
          },
        }}
      >
        <DialogTitle>{selectedEvent ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogContent className="event-dialog-content" sx={{ padding: '16px', overflow: 'hidden' }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Event Type</FormLabel>
            <Box display="flex" alignItems="center">
              <RadioGroup
                row
                value={isRange ? "range" : "single"}
                onChange={(e) => setIsRange(e.target.value === "range")}
              >
                <FormControlLabel value="single" control={<Radio />} label="Single" />
                <FormControlLabel value="range" control={<Radio />} label="Range" />
              </RadioGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isFullDay}
                    onChange={(e) => setIsFullDay(e.target.checked)}
                  />
                }
                label="Full Day"
              />
            </Box>
          </FormControl>
          <TextField
            margin="dense"
            label="Event Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
          />

          {isRange ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={isFullDay ? 12 : 7}>
                  <TextField
                    margin="dense"
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {!isFullDay && (
                  <Grid item xs={5}>
                    <TextField
                      margin="dense"
                      label="Start Time"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={isFullDay ? 12 : 7}>
                  <TextField
                    margin="dense"
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {!isFullDay && (
                  <Grid item xs={5}>
                    <TextField
                      margin="dense"
                      label="End Time"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <>
              <TextField
                margin="dense"
                label="Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              
              {!isFullDay && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      margin="dense"
                      label="Start Time"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      margin="dense"
                      label="End Time"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}
            </>
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel id="ovitrap-label">Ovitrap</InputLabel>
            <Select
              labelId="ovitrap-label"
              name="ovitrap"
              value={formData.ovitrap}
              onChange={handleInputChange}
              label="Ovitrap"
            >
              {ovitraps.map((ovitrap) => (
                <MenuItem key={ovitrap.ovitrapId} value={ovitrap.ovitrapId}>
                  {ovitrap.ovitrapId} - {ovitrap.metadata?.address || 'No address'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset" sx={{ marginTop: '16px' }}>
            <FormLabel component="legend">Status</FormLabel>
            <RadioGroup
              row
              aria-label="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              sx={{ gap: '16px' }} // Reduce spacing between radio buttons
            >
              <FormControlLabel value="not done" control={<Radio />} label="Not Done" />
              <FormControlLabel value="done" control={<Radio />} label="Done" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ padding: '16px', justifyContent: 'flex-end', gap: '8px' }}> {/* Adjust spacing */}
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: 'black', backgroundColor: 'white' }}
          >
            Cancel
          </Button>
          {selectedEvent && (
            <Button 
              onClick={() => handleConfirmAction(
                handleDelete,
                "Delete Event",
                "Are you sure you want to delete this event?"
              )}
              color="error"
              sx={{ mr: 'auto' }}
            >
              Delete
            </Button>
          )}
          <Button 
            onClick={() => handleConfirmAction(
              handleFormSubmit,
              selectedEvent ? "Update Event" : "Create Event",
              selectedEvent 
                ? "Are you sure you want to update this event?"
                : "Are you sure you want to create this event?"
            )}
            sx={{ color: 'black', backgroundColor: 'white' }}
          >
            {selectedEvent ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </MuiDialog>

      <MuiDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={{ color: 'black', backgroundColor: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            color={confirmDialog.title.includes('Delete') ? 'error' : 'primary'}
            sx={confirmDialog.title.includes('Delete') ? {} : { color: 'black', backgroundColor: 'white' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </MuiDialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventDialog;