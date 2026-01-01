import { useState, useRef, useEffect } from 'react';
import { formatDuration } from '../../utils/helpers';

const MusicPlayer = ({ playlist }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);

  const currentTrack = playlist[currentTrackIndex];

  // Set volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      handleNext();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleError = () => {
      console.error('Error loading audio');
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrackIndex, playlist.length]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Playback error:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      // Loop back to first song
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      // If more than 3 seconds played, restart current song
      audioRef.current.currentTime = 0;
    } else if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!currentTrack) {
    return (
      <div className="bg-spotify-black rounded-lg p-6 text-center">
        <p className="text-spotify-lightGray text-lg">No songs to play</p>
        <p className="text-spotify-lightGray text-sm mt-2">Add some songs to start listening!</p>
      </div>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-spotify-black to-spotify-gray rounded-xl p-6 shadow-2xl animate-fadeIn">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.previewUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Now Playing Header */}
      <div className="mb-6">
        <p className="text-spotify-green text-sm font-semibold mb-2 uppercase tracking-wider">
          Now Playing
        </p>
        <div className="flex items-center gap-4">
          {/* Album Art with Pulse Animation */}
          <div className="relative group">
            <div className={`absolute inset-0 bg-spotify-green rounded-lg blur-xl opacity-30 ${isPlaying ? 'animate-pulse' : ''}`}></div>
            {currentTrack.albumArt ? (
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.album}
                className="w-24 h-24 rounded-lg relative z-10 shadow-xl group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-spotify-gray flex items-center justify-center relative z-10">
                <span className="text-4xl">🎵</span>
              </div>
            )}
            {/* Playing Animation Overlay */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1 h-7 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-xl mb-1 truncate">
              {currentTrack.title}
            </h3>
            <p className="text-spotify-lightGray text-sm truncate">
              {currentTrack.artist}
            </p>
            <p className="text-spotify-lightGray text-xs mt-1">
              Track {currentTrackIndex + 1} of {playlist.length}
            </p>
          </div>

          {/* Vote Display */}
          <div className="text-center bg-spotify-black bg-opacity-50 px-4 py-2 rounded-lg">
            <div className="text-spotify-green text-2xl font-bold">
              {currentTrack.votes}
            </div>
            <div className="text-spotify-lightGray text-xs">votes</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="w-full h-2 bg-spotify-gray rounded-full cursor-pointer group relative overflow-hidden"
          onClick={handleSeek}
        >
          {/* Background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
          
          {/* Progress */}
          <div
            className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>

          {/* Hover indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between mt-2 text-xs text-spotify-lightGray">
          <span>{formatDuration(currentTime * 1000)}</span>
          <span>{duration > 0 ? formatDuration(duration * 1000) : '0:00'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentTrackIndex === 0 && currentTime <= 3}
          className="text-spotify-lightGray hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-110"
          title="Previous track"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={!currentTrack.previewUrl}
          className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center text-white hover:bg-green-600 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {!currentTrack.previewUrl ? (
            <span className="text-2xl">🚫</span>
          ) : isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="text-spotify-lightGray hover:text-white transition transform hover:scale-110"
          title="Next track"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z" />
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-spotify-lightGray" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-spotify-gray rounded-full appearance-none cursor-pointer slider"
          title="Volume"
        />
        <span className="text-spotify-lightGray text-sm w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Preview Notice */}
      {currentTrack.previewUrl && (
        <div className="mt-4 text-center">
          <p className="text-spotify-lightGray text-xs">
            ⚠️ Playing 30-second preview from Spotify
          </p>
        </div>
      )}
      {!currentTrack.previewUrl && (
        <div className="mt-4 text-center">
          <p className="text-red-400 text-xs">
            ❌ No preview available for this track
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;