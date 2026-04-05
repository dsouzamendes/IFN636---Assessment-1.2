const Entry = require('../models/Entry');

exports.createEntry = async (req, res) => {
  try {
    const { title, description, mood, date, location, tags } = req.body;

    if (!title || !description || !mood) {
      return res.status(400).json({ message: 'Title, description, and mood are required' });
    }

    const entryData = {
      user: req.user.id,
      title,
      description,
      mood,
      tags: tags || [],
    };

    if (date) entryData.date = new Date(date);
    if (location) entryData.location = location;

    const entry = new Entry(entryData);

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const { mood, search, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (mood) {
      filter.mood = mood;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const entries = await Entry.find(filter).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntryById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Verify ownership
    if (entry.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this entry' });
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Verify ownership
    if (entry.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }

    const { title, description, mood, date, location, tags } = req.body;

    if (title !== undefined) entry.title = title;
    if (description !== undefined) entry.description = description;
    if (mood !== undefined) entry.mood = mood;
    if (date !== undefined) entry.date = new Date(date);
    if (location !== undefined) entry.location = location;
    if (tags !== undefined) entry.tags = tags;

    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Verify ownership
    if (entry.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    await Entry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
