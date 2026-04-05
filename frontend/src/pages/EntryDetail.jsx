import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import EntryForm from '../components/EntryForm';

const moodEmojis = {
  Happy: '😊', Sad: '😢', Calm: '😌', Excited: '🤩',
  Anxious: '😰', Grateful: '🙏', Angry: '😠', Neutral: '😐'
};

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEntry();
  }, [id, user]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEntry(response.data);
    } catch (error) {
      alert('Failed to load entry');
      navigate('/entries');
    } finally {
      setLoading(false);
    }
  };

  const handleEntryUpdated = (updatedEntry) => {
    setEntry(updatedEntry);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axiosInstance.delete(`/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/entries');
    } catch (error) {
      alert('Failed to delete entry');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!entry) return <div className="text-center mt-20">Entry not found</div>;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <button
        onClick={() => navigate('/entries')}
        className="mb-6 text-teal-600 hover:text-teal-700 font-semibold"
      >
        ← Back to Entries
      </button>

      {isEditing ? (
        <div className="bg-white p-6 shadow-md rounded">
          <EntryForm
            entry={entry}
            onEntryCreated={() => {}}
            onEntryUpdated={handleEntryUpdated}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded overflow-hidden">
          <div className="bg-teal-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{entry.title}</h1>
                <p className="text-teal-200 mt-1">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <span className="text-5xl">{moodEmojis[entry.mood] || '😐'}</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-500">Mood</p>
                <p className="text-gray-800">{entry.mood}</p>
              </div>
              {entry.location && (
                <div>
                  <p className="text-sm font-semibold text-gray-500">Location</p>
                  <p className="text-gray-800">📍 {entry.location}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">Entry</p>
              <p className="text-gray-700 whitespace-pre-wrap">{entry.description}</p>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, idx) => (
                    <span key={idx} className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryDetail;


