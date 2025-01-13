import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Image from '../models/Images.js';
import User from '../models/Users.js';

const router = express.Router();

// Important: Order matters - put specific routes before parametric routes
router.get('/scan-by/users', async (req, res) => {
  try {
    // Get distinct scan_by values (clerk user IDs)
    const distinctClerkIds = await Image.distinct('analysisData.scan_by');
    
    // Find users where clerkUserId matches scan_by values
    const users = await User.find({
      clerkUserId: { $in: distinctClerkIds.filter(id => id != null) }
    }).select('firstName lastName clerkUserId');

    // Format user data using clerkUserId as _id
    const formattedUsers = users.map(user => ({
      _id: user.clerkUserId, // Use clerkUserId instead of MongoDB _id
      fullName: `${user.firstName} ${user.lastName}`
    }));

    console.log('Found users:', formattedUsers);
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching scan-by users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message,
      stack: error.stack 
    });
  }
});

router.get('/stats/aggregate', async (req, res) => {
  try {
    const { timeFrame, months, year, scan_by } = req.query;
    const selectedMonths = months ? months.split(',').map(Number) : [];
    const selectedYear = parseInt(year) || new Date().getFullYear();
    
    let dateFormat = "%Y-%m-%d"; // default format
    let dateMatch = {};
    let startDate = new Date(selectedYear, 0, 1);
    let endDate = new Date(selectedYear, 11, 31);

    switch(timeFrame) {
      case 'month':
        const month = selectedMonths[0] || (new Date().getMonth() + 1);
        startDate = new Date(selectedYear, month - 1, 1);
        endDate = new Date(selectedYear, month, 0);
        break;
      case 'day':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'week':
        dateFormat = "%Y-%U";
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 28);
        break;
      // year is default
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (scan_by) {
      matchQuery["analysisData.scan_by"] = scan_by; // Use clerkUserId directly
    }

    console.log('Query:', { timeFrame, startDate, endDate, scan_by, matchQuery });

    const timeSeriesData = await Image.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          singleEggs: { $avg: "$analysisData.singleEggs" },
          clusteredEggs: { $avg: "$analysisData.clusteredEggs" },
          totalEggs: { $avg: "$analysisData.totalEggs" },
          clustersCount: { $avg: "$analysisData.clustersCount" },
          avgEggsPerCluster: { $avg: "$analysisData.avgEggsPerCluster" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    console.log('Results:', timeSeriesData);
    res.json({ timeSeriesData });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Post new image with analysis
router.post('/', async (req, res) => {
  try {
    const { imageData, analysisData } = req.body;
    
    // Remove the data:image/jpeg;base64 prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    
    // Create buffer from base64
    const buffer = Buffer.from(base64Data, 'base64');
    
    const imageId = uuidv4();
    
    const newImage = new Image({
      imageId,
      image: {
        data: buffer,
        contentType: 'image/jpeg'
      },
      analysisData: JSON.parse(analysisData)
    });

    await newImage.save();
    console.log('Saved image to MongoDB:', imageId);

    res.status(201).json({
      message: 'Image and analysis saved successfully',
      imageId,
      image: newImage
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ 
      message: 'Error saving image and analysis', 
      error: error.message 
    });
  }
});

// Get image by ID - Move this AFTER the stats route
router.get('/:imageId', async (req, res) => {
  try {
    const image = await Image.findOne({ imageId: req.params.imageId });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.set('Content-Type', image.image.contentType);
    res.send(image.image.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
});

// Get all images without pagination
router.get('/', async (req, res) => {
  try {
    // Fetch all documents
    const images = await Image.find({})
      .select('-__v')
      .populate('uploadedBy', 'firstName lastName');

    // Remove pagination info
    res.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      message: 'Error fetching images', 
      error: error.message 
    });
  }
});

// Update image by ID
router.put('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { analysisData } = req.body; // Now expecting analysisData object

    console.log(`Received PUT request for imageId: ${imageId}`);
    console.log('Update data:', analysisData);

    const updatedImage = await Image.findOneAndUpdate(
      { imageId },
      { $set: { analysisData } }, // Update the entire analysisData object
      { new: true, runValidators: true }
    );

    if (!updatedImage) {
      console.log(`Image with imageId ${imageId} not found.`);
      return res.status(404).json({ message: 'Image not found' });
    }

    console.log(`Image with imageId ${imageId} updated successfully.`);
    res.status(200).json({ image: updatedImage });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete image by ID
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const deletedImage = await Image.findOneAndDelete({ imageId });
    if (!deletedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

export default router;
