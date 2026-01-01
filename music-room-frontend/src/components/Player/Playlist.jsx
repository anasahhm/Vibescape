import { useState } from 'react';
import { playlist as playlistAPI } from '../../services/api';
import { formatDuration } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

const Playlist = ({ playlist, loungeId }) => {
  const { user } = useAuth();
  const [votingStates, setVotingStates] = useState({});

  const handleVote = async (songId, voteValue) => {
    if (votingStates[songId]) return;

    try {
      setVotingStates(prev => ({ ...prev, [songId]: true }));
      await playlistAPI.vote(songId, voteValue);
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setVotingStates(prev => ({ ...prev, [songId]: false }));
    }
  };

  const handleRemove = async (songId) => {
    if (window.confirm('Are you sure you want to remove this song?')) {
      try {
        await playlistAPI.removeSong(songId);
      } catch (err) {
        alert('Failed to remove song');
      }
    }
  };

  const getUserVote = (song) => {
    const voter = song.voters?.find(v => v.userId === user._id);
    return voter?.vote || 0;
  };

  if (playlist.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-spotify-lightGray">No songs in the playlist yet.</p>
        <p className="text-spotify-lightGray mt-2">Be the first to add a song!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {playlist.map((song, index) => {
        const userVote = getUserVote(song);
        const canRemove = song.addedBy._id === user._id;

        return (
          <div
            key={song._id}
            className="bg-spotify-black rounded-lg p-4 flex items-center gap-3"
          >
            <div className="text-spotify-lightGray font-semibold w-8 text-center">
              {index + 1}
            </div>

            {song.albumArt && (
              <img
                src={song.albumArt}
                alt={song.album}
                className="w-16 h-16 rounded"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{song.title}</p>
              <p className="text-spotify-lightGray text-sm truncate">{song.artist}</p>
              <p className="text-spotify-lightGray text-xs mt-1">
                Added by {song.addedBy.displayName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(song._id, 1)}
                disabled={votingStates[song._id]}
                className={`p-2 rounded transition ${
                  userVote === 1
                    ? 'text-spotify-green'
                    : 'text-spotify-lightGray hover:text-white'
                }`}
              >
                ▲
              </button>
              <span className="text-white font-semibold w-8 text-center">
                {song.votes}
              </span>
              <button
                onClick={() => handleVote(song._id, -1)}
                disabled={votingStates[song._id]}
                className={`p-2 rounded transition ${
                  userVote === -1
                    ? 'text-red-500'
                    : 'text-spotify-lightGray hover:text-white'
                }`}
              >
                ▼
              </button>
            </div>

            <span className="text-spotify-lightGray text-sm w-12 text-right">
              {formatDuration(song.duration)}
            </span>

            {canRemove && (
              <button
                onClick={() => handleRemove(song._id)}
                className="text-red-500 hover:text-red-400 transition p-2"
                title="Remove song"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Playlist;