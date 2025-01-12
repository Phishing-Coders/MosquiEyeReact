import express from 'express';
import Ovitrap from '../models/Ovitrap.js';
import Image from '../models/Images.js';

const router = express.Router();

router.get('/statistics', async (req, res) => {
  try {
    const [ovitraps, images] = await Promise.all([
      Ovitrap.find(),
      Image.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const stats = {
      activeOvitraps: ovitraps.filter(o => o.status === 'active').length,
      totalEggs: images.reduce((sum, img) => sum + (img.analysisData?.totalEggs || 0), 0),
      riskAreas: ovitraps.filter(o => o.status === 'maintenance').length,
      avgEggsPerTrap: images.length ? Math.round(images.reduce((sum, img) => sum + (img.analysisData?.totalEggs || 0), 0) / ovitraps.length) : 0,
      recentUploads: images.map(img => ({
        id: img._id,
        ovitrapId: img.ovitrapId,
        totalEggs: img.analysisData?.totalEggs || 0,
        date: img.createdAt
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;