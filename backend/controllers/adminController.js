const User = require('../models/User');
const Entry = require('../models/Entry');

/**
 * 1. GET ALL USERS
 * Uses aggregation to count entries per user and include 'entryCount'
 */
exports.getAllUsers = async (req, res) => {
  try {
    const usersWithCounts = await User.aggregate([
      {
        // Join with the 'entries' collection
        $lookup: {
          from: 'entries',       // Ensure this matches your MongoDB collection name
          localField: '_id',     // User ID in User collection
          foreignField: 'user',  // User ID field in Entry collection
          as: 'userEntries'      // Temporary array
        }
      },
      {
        // Create the 'entryCount' field by counting the array size
        $addFields: {
          entryCount: { $size: '$userEntries' }
        }
      },
      {
        // Remove sensitive password and the temporary array
        $project: {
          password: 0,
          userEntries: 0
        }
      },
      {
        // Sort by newest joined date
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 2. GET ADMIN STATS
 * Provides the totals for the dashboard cards
 */
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEntries = await Entry.countDocuments();

    res.status(200).json({
      totalUsers,
      totalEntries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**

 * 3. DELETE USER
 * Removes a user and all of their associated data
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all entries belonging to this user
    await Entry.deleteMany({ user: userId });

    // Delete the actual user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User and their entries deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
