import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const MOOD_OPTIONS = [
  { value: 'Happy', emoji: '😊', label: 'Happy' },
  { value: 'Sad', emoji: '😢', label: 'Sad' },
  { value: 'Calm', emoji: '😌', label: 'Calm' },
  { value: 'Excited', emoji: '🤩', label: 'Excited' },
  { value: 'Anxious', emoji: '😰', label: 'Anxious' },
  { value: 'Grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'Angry', emoji: '😠', label: 'Angry' },
  { value: 'Neutral', emoji: '😐', label: 'Neutral' },
];

const EntryForm = ({ entry = null, onEntryCreated, onEntryUpdated, onCancel }) => {
  const { user } = useAuth();
  const isEditMode = !!entry;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mood: 'Neutral',
    location: '',
    tags: '',
  });

  const [tagChips, setTagChips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load entry data if editing
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        description: entry.description || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        mood: entry.mood || 'Neutral',
        location: entry.location || '',
        tags: entry.tags?.join(', ') || '',
      });
      setTagChips(entry.tags || []);
    }
  }, [entry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tags: value }));
    if (value.trim()) {
      const newTags = value.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      setTagChips(newTags);
    } else {
      setTagChips([]);
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = tagChips.filter((_, index) => index !== indexToRemove);
    setTagChips(newTags);
    setFormData((prev) => ({ ...prev, tags: newTags.join(', ') }));
  };

  const getMoodEmoji = (mood) => {
    const option = MOOD_OPTIONS.find((m) => m.value === mood);
    return option ? option.emoji : '😐';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        mood: formData.mood,
        location: formData.location,
        tags: tagChips,
      };

      const headers = { Authorization: `Bearer ${user.token}` };

      if (isEditMode) {
        const response = await axiosInstance.put(`/api/entries/${entry._id}`, submitData, { headers });
        if (onEntryUpdated) onEntryUpdated(response.data);
      } else {
        const response = await axiosInstance.post('/api/entries', submitData, { headers });
        if (onEntryCreated) onEntryCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-teal-800">
        {isEditMode ? 'Edit Entry' : 'New Entry'}
      </h2>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Give your entry a title..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Date and Mood Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="mood" className="block text-sm font-semibold text-gray-700 mb-2">
            How are you feeling?
          </label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg p-2 focus-within:border-teal-500">
            <span className="text-3xl mr-3">{getMoodEmoji(formData.mood)}</span>
            <select
              id="mood"
              name="mood"
              value={formData.mood}
              onChange={handleInputChange}
              className="flex-1 bg-transparent focus:outline-none font-medium text-gray-700"
            >
              {MOOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Where are you? (optional)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          What's on your mind?
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Write your thoughts, feelings, and experiences..."
          rows="6"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors resize-none"
          required
        ></textarea>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleTagsChange}
          placeholder="e.g., work, family, goals, travel"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
        />
        {tagChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tagChips.map((tag, index) => (
              <div
                key={index}
                className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-teal-600 hover:text-teal-900"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Entry' : 'Create Entry'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EntryForm;


