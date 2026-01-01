import { useState } from 'react';
import { lounge } from '../../services/api';

const JoinLounge = ({ onClose, onLoungeJoined }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a lounge code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await lounge.join(code.toUpperCase());
      onLoungeJoined(response.data.lounge);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join lounge. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-gray rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Join Lounge</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-spotify-lightGray mb-2">Lounge Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green font-mono text-center text-2xl tracking-widest"
              placeholder="ABC123"
              maxLength={6}
            />
            <p className="text-spotify-lightGray text-sm mt-2">
              Enter the 6-character code shared by your friend
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-spotify-green text-white py-3 rounded-full font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Lounge'}
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

export default JoinLounge;