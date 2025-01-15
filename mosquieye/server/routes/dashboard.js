import express from 'express';
import Ovitrap from '../models/Ovitrap.js';
import Image from '../models/Images.js';
import User from '../models/Users.js';

const router = express.Router();

router.get('/statistics', async (req, res) => {
  try {
    // Get current date range for this week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const [ovitraps, images, weeklyStats] = await Promise.all([
      Ovitrap.find(),
      Image.find().sort({ createdAt: -1 }).limit(10),
      Image.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            totalEggs: { $sum: '$analysisData.totalEggs' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      User.find({}, 'clerkUserId firstName lastName')
    ]);

    const ovitrapData = ovitraps.map(ovitrap => ({
      id: ovitrap.ovitrapId,
      location: ovitrap.location,
      status: ovitrap.status,
      metadata: ovitrap.metadata,
      totalEggs: ovitrap.statistics?.totalEggs || 0
    }));

    // Convert weeklyStats to the format expected by LineChart
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedWeeklyStats = daysOfWeek.map((day, index) => {
      const stat = weeklyStats.find(s => s._id === index + 1);
      return {
        x: day,
        y: stat ? stat.totalEggs : 0
      }
    });

    const scan_by_ids = images.map(img => img.analysisData?.scan_by).filter(id => id);
    const users = await User.find({ clerkUserId: { $in: scan_by_ids } });

    const userMap = users.reduce((acc, user) => {
      acc[user.clerkUserId] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {});

    const stats = {
      activeOvitraps: ovitraps.filter(o => o.status === 'Active').length,
      totalEggs: images.reduce((sum, img) => sum + (img.analysisData?.totalEggs || 0), 0),
      riskAreas: ovitraps.filter(o => o.status === 'Maintenance').length,
      avgEggsPerTrap: images.length ? Math.round(images.reduce((sum, img) => sum + (img.analysisData?.totalEggs || 0), 0) / ovitraps.length) : 0,
      recentUploads: images.map(img => ({
        id: img._id,
        ovitrapId: img.ovitrapId,
        totalEggs: img.analysisData?.totalEggs || 0,
        date: img.createdAt,
        scan_by: img.analysisData?.scan_by || 'Unknown',
        userName: userMap[img.analysisData?.scan_by] || 'Unknown User',
        location: {
          coordinates: img?.location?.coordinates || [103.63767742492678, 1.5587898459904728]
        }
      })),
      monthlyStats: formattedWeeklyStats, // This will now show accurate daily counts
      ovitraps: ovitrapData
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;