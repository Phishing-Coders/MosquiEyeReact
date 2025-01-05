import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// Create a new schedule
router.post('/', async (req, res) => {
  try {
    console.log('Received schedule data:', req.body);

    const { ovitrap_id, schedule_by, type, startDate, endDate, startTime, endTime, task, status, isFullDay } = req.body;

    // Validate required fields
    if (!ovitrap_id || !schedule_by || !type || !startDate || !task) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['ovitrap_id', 'schedule_by', 'type', 'startDate', 'task']
      });
    }

    // Validate type
    if (!['single', 'range'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid type. Must be either "single" or "range"'
      });
    }

    // Validate dates
    if (type === 'range' && !endDate) {
      return res.status(400).json({
        message: 'End date is required for range type schedules'
      });
    }

    // Validate times
    if (!startTime || !endTime) {
      return res.status(400).json({
        message: 'Start time and end time are required'
      });
    }

    // Create new schedule
    const newSchedule = new Schedule({
      ovitrap_id,
      schedule_by,
      type,
      startDate: new Date(startDate),
      endDate: type === 'range' ? new Date(endDate) : null,
      startTime,
      endTime,  // Always include endTime
      task,
      status: status || 'not done',
      isFullDay: isFullDay || false  // Add this line
    });

    console.log('Creating new schedule:', newSchedule);

    // Save to database
    await newSchedule.save();
    console.log('Schedule saved successfully:', newSchedule._id);

    // Send response
    res.status(201).json({
      message: 'Schedule created successfully',
      scheduleId: newSchedule._id,
      schedule: newSchedule
    });

  } catch (error) {
    console.error('Error creating schedule:', error);
    console.error('Validation errors:', error.errors);
    res.status(500).json({
      message: 'Error creating schedule',
      error: error.message,
      details: error.errors
    });
  }
});

// Get schedules with pagination
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find({})
      .populate('schedule_by', 'firstName lastName')
      .lean()
      .exec();

    // Format dates and times for frontend
    const formattedSchedules = schedules.map(schedule => ({
      ...schedule,
      startDate: schedule.startDate.toISOString(),
      endDate: schedule.endDate ? schedule.endDate.toISOString() : null,
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || ''
    }));

    res.json({
      schedules: formattedSchedules,
      total: schedules.length
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      message: 'Error fetching schedules', 
      error: error.message 
    });
  }
});

// Update a schedule
router.put('/:id', async (req, res) => {
  try {
    const { ovitrap_id, schedule_by, type, startDate, endDate, startTime, endTime, task, status, isFullDay } = req.body;
    
    // First, get the existing schedule
    const existingSchedule = await Schedule.findById(req.params.id);
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Only update the date if it has actually changed
    const updateData = {
      ovitrap_id: ovitrap_id || existingSchedule.ovitrap_id,
      schedule_by: schedule_by || existingSchedule.schedule_by,
      type: type || existingSchedule.type,
      task: task || existingSchedule.task,
      status: status || existingSchedule.status,
      startTime: startTime || existingSchedule.startTime,
      endTime: endTime || existingSchedule.endTime,
      isFullDay: isFullDay !== undefined ? isFullDay : existingSchedule.isFullDay
    };

    // Only update dates if they've changed
    if (startDate && startDate !== existingSchedule.startDate.toISOString().split('T')[0]) {
      updateData.startDate = new Date(startDate);
    }

    if (type === 'range') {
      if (endDate && endDate !== (existingSchedule.endDate ? existingSchedule.endDate.toISOString().split('T')[0] : null)) {
        updateData.endDate = new Date(endDate);
      }
    } else {
      updateData.endDate = null;
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Error updating schedule', error: error.message });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
});

export default router;