// models/Ovitrap.js
import mongoose from 'mongoose';

const ovitrapSchema = new mongoose.Schema({
  ovitrapId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  // Change this field to accept Clerk user IDs
  assignedUsers: [{
    type: String  // Changed from mongoose.Types.ObjectId to String
  }],
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Images'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Inactive'
  },
  metadata: {
    area: String,
    district: String,
    address: String
  },
  statistics: {
    totalEggs: Number,
    lastInspection: Date,
    riskLevel: String
  }
}, { timestamps: true });

const Ovitrap = mongoose.model('Ovitraps', ovitrapSchema);
export default Ovitrap;