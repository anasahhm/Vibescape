import { useState } from 'react';
import { playlist } from '../../services/api';
import { formatDuration } from '../../utils/helpers';

const TrackSearch = ({ loungeId, onSongAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await playlist.searchTracks(query);
      setResults(response.data.tracks);
    } catch (err) {
      setError('Failed to search tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (track) => {
    try {
      await playlist.addSong({ loungeId, track });
      setQuery('');
      setResults([]);
      onSongAdded();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add song');
    }
  };

  return (
    <div className="bg-spotify-black rounded-lg p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs..."
            className="flex-1 bg-spotify-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-spotify-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-sm mb-4">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          {results.map((track, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-spotify-gray rounded-lg transition"
            >
              {track.albumArt && (
                <img
                  src={track.albumArt}
                  alt={track.album}
                  className="w-12 h-12 rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{track.title}</p>
                <p className="text-spotify-lightGray text-sm truncate">{track.artist}</p>
              </div>
              <span className="text-spotify-lightGray text-sm">
                {formatDuration(track.duration)}
              </span>
              <button
                onClick={() => handleAddSong(track)}
                className="bg-spotify-green text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-green-600 transition"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackSearch;