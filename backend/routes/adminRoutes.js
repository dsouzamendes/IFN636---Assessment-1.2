const express = require('express');
const {
  getAllUsers,
  getStats,
  deleteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

// All routes protected by authentication and admin middleware
router.get('/users', protect, admin, getAllUsers);
router.get('/stats', protect, admin, getStats);
router.delete('/users/:userId', protect, admin, deleteUser);

module.exports = router;
