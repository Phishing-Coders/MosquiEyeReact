import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  ovitrap_id: {
    type: String,
    required: [true, 'Ovitrap ID is required']
  },
  schedule_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: {
      values: ['single', 'range'],
      message: '{VALUE} is not a valid schedule type'
    },
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: function() { 
      return this.type === 'range';
    },
    validate: {
      validator: function(value) {
        if (this.type === 'range') {
          return value > this.startDate;
        }
        return true;
      },
      message: 'End date must be after start date'
    }
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        if (this.isFullDay) {
          return v === '00:00';
        }
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        if (this.isFullDay) {
          return v === '23:59';
        }
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  isFullDay: {
    type: Boolean,
    default: false
  },
  task: {
    type: String,
    required: [true, 'Task description is required']
  },
  status: {
    type: String,
    enum: {
      values: ['not done', 'done'],
      message: '{VALUE} is not a valid status'
    },
    default: 'not done'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;