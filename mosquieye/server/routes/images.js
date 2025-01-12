import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Image from '../models/Images.js';
import Ovitrap from '../models/Ovitrap.js';

const router = express.Router();

// Post new image with analysis
router.post('/', async (req, res) => {
  try {
    const { imageData, analysisData } = req.body;
    const parsedAnalysis = JSON.parse(analysisData);
    
    // Verify ovitrap exists
    if (parsedAnalysis.ovitrap) {
      const ovitrap = await Ovitrap.findOne({ ovitrapId: parsedAnalysis.ovitrap });
      if (!ovitrap) {
        return res.status(404).json({ 
          message: 'Ovitrap not found' 
        });
      }
    }
    
    // Remove the data:image/jpeg;base64 prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    
    // Create buffer from base64
    const buffer = Buffer.from(base64Data, 'base64');
    
    const imageId = uuidv4();
    
    const newImage = new Image({
      imageId,
      ovitrapId: parsedAnalysis.ovitrap, // Add ovitrap ID
      image: {
        data: buffer,
        contentType: 'image/jpeg'
      },
      analysisData: parsedAnalysis
    });

    await newImage.save();
    console.log('Saved image to MongoDB:', imageId);

    // Update ovitrap with new image reference
    if (parsedAnalysis.ovitrap) {
      await Ovitrap.findOneAndUpdate(
        { ovitrapId: parsedAnalysis.ovitrap },
        { $push: { images: newImage._id } }
      );
    }

    res.status(201).json({
      message: 'Image and analysis saved successfully',
      imageId,
      ovitrapId: parsedAnalysis.ovitrap
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ 
      message: 'Error saving image and analysis', 
      error: error.message 
    });
  }
});

// Get image by ID
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
