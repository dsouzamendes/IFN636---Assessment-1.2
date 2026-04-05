const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: String,
      enum: ['Happy', 'Sad', 'Calm', 'Excited', 'Anxious', 'Grateful', 'Angry', 'Neutral'],
      required: true,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    tags: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'Tags array cannot exceed 10 items',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
entrySchema.index({ user: 1, date: -1 });
entrySchema.index({ user: 1, mood: 1 });
entrySchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Entry', entrySchema);
