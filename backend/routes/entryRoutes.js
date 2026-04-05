const express = require('express');
const {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require('../controllers/entryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected by authentication
router.post('/', protect, createEntry);
router.get('/', protect, getEntries);
router.get('/:id', protect, getEntryById);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;
