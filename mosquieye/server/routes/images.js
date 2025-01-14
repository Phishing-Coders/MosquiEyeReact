import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Image from '../models/Images.js';
import Ovitrap from '../models/Ovitrap.js';
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
    const { startDate, endDate, scan_by, groupBy } = req.query;
    
    // Parse dates and adjust for timezone
    const start = new Date(startDate);
    const end = new Date(endDate);

    const matchQuery = {
      createdAt: {
        $gte: start,
        $lte: end
      }
    };

    console.log('Date range:', { 
      start: start.toISOString(), 
      end: end.toISOString() 
    });

    if (scan_by) {
      matchQuery["analysisData.scan_by"] = scan_by;
    }

    console.log('Query:', { startDate, endDate, scan_by, matchQuery });

    // Decide grouping field
    let groupField = {
      $dateToString: { 
        format: "%Y-%m-%d", 
        date: "$createdAt" 
      }
    };

    if (groupBy === "ovitrap") {
      groupField = "$ovitrapId";
    } else if (groupBy === "type") {
      groupField = "$analysisData.ovitrap_type";
    } else if (groupBy === "scan_by") {
      groupField = "$analysisData.scan_by";
    }

    const timeSeriesData = await Image.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupField,
          singleEggs: { $avg: "$analysisData.singleEggs" },
          clusteredEggs: { $avg: "$analysisData.clusteredEggs" },
          totalEggs: { $avg: "$analysisData.totalEggs" },
          clustersCount: { $avg: "$analysisData.clustersCount" },
          avgEggsPerCluster: { $avg: "$analysisData.avgEggsPerCluster" },
          singlesTotalArea: { $avg: "$analysisData.singlesTotalArea" },
          singlesAvg: { $avg: "$analysisData.singlesAvg" },
          clustersTotalArea: { $avg: "$analysisData.clustersTotalArea" },
          avgClusterArea: { $avg: "$analysisData.avgClusterArea" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Rename _id to dimensionValue
    const formattedData = timeSeriesData.map(item => ({
      dimensionValue: item._id,
      ...item,
      _id: undefined
    }));

    console.log('Results:', formattedData);
    res.json({ timeSeriesData: formattedData });
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
    
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid analysis data format' });
    }

    // Remove the data:image/jpeg;base64 prefix and create buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const imageId = uuidv4();
    
    const newImage = new Image({
      imageId,
      ovitrapId: parsedAnalysis.ovitrap,
      image: {
        data: buffer,
        contentType: 'image/jpeg'
      },
      analysisData: {
        ...parsedAnalysis,
        scan_by: parsedAnalysis.scan_by // Store Clerk user ID as string
      }
    });

    await newImage.save();
    
    // Update ovitrap if ID exists
    if (parsedAnalysis.ovitrap) {
      try {
        await Ovitrap.findOneAndUpdate(
          { ovitrapId: parsedAnalysis.ovitrap },
          { $push: { images: newImage._id } }
        );
      } catch (error) {
        console.warn('Error updating ovitrap:', error);
        // Continue even if ovitrap update fails
      }
    }

    res.status(201).json({
      message: 'Image and analysis saved successfully',
      imageId,
      ovitrapId: parsedAnalysis.ovitrap
    });
  } catch (error) {
    console.error('Server error saving image:', error);
    res.status(500).json({ 
      message: 'Error saving image and analysis', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
