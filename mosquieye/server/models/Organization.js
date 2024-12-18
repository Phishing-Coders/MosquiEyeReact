// server/models/Organization.js
const organizationSchema = new mongoose.Schema({
  clerkOrgId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    role: {
      type: String,
      enum: ['org:admin', 'org:health_office', 'org:operations_team']
    }
  }]
}, { timestamps: true });