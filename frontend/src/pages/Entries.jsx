import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';

const moodOptions = ['Happy', 'Sad', 'Calm', 'Excited', 'Anxious', 'Grateful', 'Angry', 'Neutral'];

const Entries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/entries', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEntries(response.data);
    } catch (error) {
      alert('Failed to fetch entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleEntryCreated = (newEntry) => {
    setEntries([newEntry, ...entries]);
    setShowForm(false);
  };

  const handleEntryUpdated = (updatedEntry) => {
    setEntries(entries.map(e => e._id === updatedEntry._id ? updatedEntry : e));
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axiosInstance.delete(`/api/entries/${entryId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEntries(entries.filter(e => e._id !== entryId));
    } catch (error) {
      alert('Failed to delete entry.');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const filteredEntries = entries.filter(entry => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = entry.title.toLowerCase().includes(term) ||
      entry.description.toLowerCase().includes(term) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(term)));
    const matchesMood = !moodFilter || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  if (!user) return null;

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-teal-800">My Diary Entries</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingEntry(null); }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded"
        >
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 shadow-md rounded mb-6">
          <EntryForm
            entry={editingEntry}
            onEntryCreated={handleEntryCreated}
            onEntryUpdated={handleEntryUpdated}
            onCancel={() => { setShowForm(false); setEditingEntry(null); }}
          />
        </div>
      )}

      <div className="bg-white p-4 shadow-md rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Moods</option>
            {moodOptions.map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="bg-white p-12 rounded shadow text-center">
          <p className="text-gray-500 text-lg">No entries found. Create your first entry!</p>
        </div>
      ) : (
        <EntryList
          entries={filteredEntries}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      )}
    </div>
  );
};

export default Entries;
