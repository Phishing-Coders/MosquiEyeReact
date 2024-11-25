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
  firstName: String,
  lastName: String
}, { timestamps: true });

const User = mongoose.model('Users', userSchema);
export default User;