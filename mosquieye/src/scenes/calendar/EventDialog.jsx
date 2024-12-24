import {
  Dialog, DialogTitle, DialogContent, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, TextField, Grid, Select, MenuItem, InputLabel,
  DialogActions, Button, Snackbar, Alert, Checkbox, Box
} from "@mui/material";

const EventDialog = ({
  openDialog, handleCloseDialog, selectedEvent, isRange, setIsRange,
  formData, handleInputChange, handleFormSubmit, snackbar, handleSnackbarClose,
  closeMorePopover, isFullDay, setIsFullDay
}) => {
  return (
    <>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        onClick={() => closeMorePopover()}
      >
        <DialogTitle>{selectedEvent ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogContent>
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
              <MenuItem value="Ovitrap 1">Ovitrap 1</MenuItem>
              <MenuItem value="Ovitrap 2">Ovitrap 2</MenuItem>
              <MenuItem value="Ovitrap 3">Ovitrap 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              label="Status"
            >
              <MenuItem value="not done">Not Done</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleFormSubmit}>
            {selectedEvent ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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