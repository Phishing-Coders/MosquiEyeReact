import express from 'express';
import Ovitrap from '../models/Ovitrap.js';

const router = express.Router();

// Create a new ovitrap
router.post('/', async (req, res) => {
    try {
      const { 
        ovitrapId,
        location,
        assignedUsers, // This should be an array of Clerk user IDs
        status,
        metadata 
      } = req.body;
  
      const newOvitrap = new Ovitrap({
        ovitrapId,
        location,
        assignedUsers, // Clerk user IDs will work now
        status: status || 'Active',
        metadata,
        lastInspection: new Date(),
        nextInspection: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
  
      await newOvitrap.save();
  
      res.status(201).json({
        message: 'Ovitrap created successfully',
        ovitrap: newOvitrap
      });
    } catch (error) {
      console.error('Error creating ovitrap:', error);
      res.status(500).json({ 
        message: 'Error creating ovitrap', 
        error: error.message 
      });
    }
  });

// Get all ovitraps
router.get('/', async (req, res) => {
  try {
    // Remove pagination and fetch all ovitraps
    const ovitraps = await Ovitrap.find({})
      .populate('assignedUsers', 'firstName lastName email')
      .populate('images')
      .select('-__v');

    res.json({
      ovitraps,
      totalOvitraps: ovitraps.length
    });
  } catch (error) {
    console.error('Error fetching ovitraps:', error);
    res.status(500).json({ 
      message: 'Error fetching ovitraps', 
      error: error.message 
    });
  }
});

// Get ovitrap by ID
router.get('/:ovitrapId', async (req, res) => {
  try {
    const ovitrap = await Ovitrap.findOne({ ovitrapId: req.params.ovitrapId })
      .populate('assignedUsers', 'firstName lastName email')
      .populate('images')
      .select('-__v');

    if (!ovitrap) {
      return res.status(404).json({ message: 'Ovitrap not found' });
    }

    res.json(ovitrap);
  } catch (error) {
    console.error('Error fetching ovitrap:', error);
    res.status(500).json({ 
      message: 'Error fetching ovitrap', 
      error: error.message 
    });
  }
});

// Get ovitraps by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const ovitraps = await Ovitrap.find({ assignedUsers: req.params.userId })
      .populate('images')
      .select('-__v');

    res.json(ovitraps);
  } catch (error) {
    console.error('Error fetching user ovitraps:', error);
    res.status(500).json({ 
      message: 'Error fetching user ovitraps', 
      error: error.message 
    });
  }
});

// Update ovitrap
router.put('/:ovitrapId', async (req, res) => {
  try {
    const { 
      location,
      assignedUsers,
      status,
      metadata,
      lastInspection 
    } = req.body;

    const updatedOvitrap = await Ovitrap.findOneAndUpdate(
      { ovitrapId: req.params.ovitrapId },
      { 
        location,
        assignedUsers,
        status,
        metadata,
        lastInspection: lastInspection ? new Date(lastInspection) : undefined,
        nextInspection: lastInspection ? new Date(new Date(lastInspection).getTime() + 7 * 24 * 60 * 60 * 1000) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updatedOvitrap) {
      return res.status(404).json({ message: 'Ovitrap not found' });
    }

    res.json({
      message: 'Ovitrap updated successfully',
      ovitrap: updatedOvitrap
    });
  } catch (error) {
    console.error('Error updating ovitrap:', error);
    res.status(500).json({ 
      message: 'Error updating ovitrap', 
      error: error.message 
    });
  }
});

// Delete ovitrap
router.delete('/:ovitrapId', async (req, res) => {
  try {
    const deletedOvitrap = await Ovitrap.findOneAndDelete({ 
      ovitrapId: req.params.ovitrapId 
    });

    if (!deletedOvitrap) {
      return res.status(404).json({ message: 'Ovitrap not found' });
    }

    res.json({
      message: 'Ovitrap deleted successfully',
      ovitrap: deletedOvitrap
    });
  } catch (error) {
    console.error('Error deleting ovitrap:', error);
    res.status(500).json({ 
      message: 'Error deleting ovitrap', 
      error: error.message 
    });
  }
});

export default router;