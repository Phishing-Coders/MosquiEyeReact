import Ovitrap from '../models/Ovitrap.js';
import User from '../models/Users.js';

export const getOvitrapsByUser = async (req, res) => {
  try {
    const userId = req.params.userId; // This will be the Clerk user ID
    const ovitraps = await Ovitrap.find({ 
      assignedUsers: userId 
    }).populate('images');
    
    res.json(ovitraps);
  } catch (error) {
    console.error('Error fetching ovitraps:', error);
    res.status(500).json({ 
      message: 'Error fetching ovitraps', 
      error: error.message 
    });
  }
};