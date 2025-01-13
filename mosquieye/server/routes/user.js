import express from 'express';
import User from '../models/Users.js';

const router = express.Router();

const ROLE_PERMISSIONS = {
  'org:admin': ['dashboard', 'team', 'profile', 'maps', 'scan', 'analysis', 'settings', 'contacts', 'qrscan', 
    'calendar', 'geography', 'faq', 'bar', 'form', 'line', 'pie', 'ovitrap', 'analysisHistory'],
  'org:operations_team': ['dashboard', 'team', 'profile', 'maps', 'scan', 'analysis', 'settings', 'contacts', 'qrscan', 
    'calendar', 'geography', 'faq', 'bar', 'form', 'line', 'pie', 'ovitrap', 'analysisHistory']
};

// Get all users
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get all users with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await User.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Get user by clerkUserId
router.get('/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const user = await User.findOne({ clerkUserId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Get user by Clerk ID
router.get('/clerk/:clerkUserId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.params.clerkUserId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Save or update user
router.post('/saveUser', async (req, res) => {
  const { 
    clerkUserId, 
    email, 
    firstName, 
    lastName, 
    role,
    organizationId 
  } = req.body;

  try {
    // Get permissions based on role
    const permissions = ROLE_PERMISSIONS[role] || [];

    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { 
        email, 
        firstName, 
        lastName,
        role,
        permissions,
        organizationId,
        lastLogin: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    res.status(200).json({
      message: 'User saved successfully',
      user
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Error saving user', error: error.message });
  }
});

// Update user by clerkUserId
router.put('/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { email, firstName, lastName } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId },
      { 
        email, 
        firstName, 
        lastName,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user by clerkUserId
router.delete('/:clerkUserId', async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const deletedUser = await User.findOneAndDelete({ clerkUserId });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;