import { useNavigate } from 'react-router-dom';

const moodEmojis = {
  Happy: '😊', Sad: '😢', Calm: '😌', Excited: '🤩',
  Anxious: '😰', Grateful: '🙏', Angry: '😠', Neutral: '😐'
};

const EntryList = ({ entries, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div>
      {entries.map((entry) => (
        <div key={entry._id} className="bg-white p-4 mb-4 rounded shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="font-bold text-lg">{entry.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleDateString()} | {moodEmojis[entry.mood]} {entry.mood}
                {entry.location && ` | 📍 ${entry.location}`}
              </p>
            </div>
            <span className="text-3xl ml-4">{moodEmojis[entry.mood] || '😐'}</span>
          </div>

          <p className="mt-2 text-gray-700">
            {entry.description.length > 150
              ? entry.description.substring(0, 150) + '...'
              : entry.description}
          </p>

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map((tag, idx) => (
                <span key={idx} className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/entries/${entry._id}`)}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              View
            </button>
            <button
              onClick={() => onEdit(entry)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(entry._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntryList;


