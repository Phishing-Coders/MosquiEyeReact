import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkUserId: { 
    type: String, 
    required: true,
    unique: true 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['org:admin', 'org:health_office', 'org:operations_team'],
    default: 'org:operations_team'
  },
  permissions: [{
    type: String,
    enum: [
      'dashboard',
      'team',
      'profile',
      'maps',
      'scan',
      'analysis',
      'settings'
    ]
  }],
  organizationId: String,
  lastLogin: Date
}, { timestamps: true });

const User = mongoose.model('Users', userSchema);
export default User;