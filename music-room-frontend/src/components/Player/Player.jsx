import { useState } from 'react';
import TrackSearch from './TrackSearch';
import Playlist from './Playlist';
import MusicPlayer from './MusicPlayer';

const Player = ({ loungeId, playlist, setPlaylist }) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="space-y-6">
      {/* Music Player */}
      {playlist.length > 0 && (
        <div className="animate-slideIn">
          <MusicPlayer playlist={playlist} />
        </div>
      )}

      {/* Playlist Management */}
      <div className="bg-spotify-gray rounded-xl p-6 animate-slideIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">📋</span>
            Playlist Queue
          </h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-spotify-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">{showSearch ? '✕' : '+'}</span>
            {showSearch ? 'Hide Search' : 'Add Song'}
          </button>
        </div>

        {showSearch && (
          <div className="mb-6 animate-scaleIn">
            <TrackSearch loungeId={loungeId} onSongAdded={() => setShowSearch(false)} />
          </div>
        )}

        <Playlist playlist={playlist} loungeId={loungeId} />
      </div>
    </div>
  );
};

export default Player;