import { useState } from 'react';
import { lounge } from '../../services/api';

const CreateLounge = ({ onClose, onLoungeCreated }) => {
  const [name, setName] = useState('');
  const [maxMembers, setMaxMembers] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a lounge name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await lounge.create({ name, maxMembers });
      onLoungeCreated(response.data.lounge);
    } catch (err) {
      setError('Failed to create lounge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-gray rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Lounge</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-spotify-lightGray mb-2">Lounge Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
              placeholder="My Awesome Lounge"
              maxLength={50}
            />
          </div>

          <div className="mb-6">
            <label className="block text-spotify-lightGray mb-2">Max Members</label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
              min="2"
              max="100"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-spotify-green text-white py-3 rounded-full font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Lounge'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-spotify-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLounge;