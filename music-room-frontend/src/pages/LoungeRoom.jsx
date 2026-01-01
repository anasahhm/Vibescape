import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lounge as loungeAPI } from '../services/api';
import { useSocket as useSocketContext } from '../context/SocketContext';
import { useSocket } from '../hooks/useSocket';
import Player from '../components/Player/Player';
import ChatBox from '../components/Chat/ChatBox';

const LoungeRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinRoom, leaveRoom } = useSocketContext();
  const [lounge, setLounge] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoungeData();
    joinRoom(id);

    return () => {
      leaveRoom(id);
    };
  }, [id]);

  const fetchLoungeData = async () => {
    try {
      const response = await loungeAPI.getDetails(id);
      setLounge(response.data.lounge);
      setPlaylist(response.data.playlist);
    } catch (error) {
      console.error('Failed to fetch lounge:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Socket event handlers
  useSocket('songAdded', (data) => {
    setPlaylist(prev => [...prev, data.song].sort((a, b) => b.votes - a.votes));
  });

  useSocket('songVoted', (data) => {
    setPlaylist(prev =>
      prev.map(song => song._id === data.song._id ? data.song : song)
        .sort((a, b) => b.votes - a.votes)
    );
  });

  useSocket('songRemoved', (data) => {
    setPlaylist(prev => prev.filter(song => song._id !== data.songId));
  });

  useSocket('memberJoined', (data) => {
    setLounge(prev => ({
      ...prev,
      members: [...prev.members, data.member]
    }));
  });

  useSocket('memberLeft', (data) => {
    setLounge(prev => ({
      ...prev,
      members: prev.members.filter(m => m._id !== data.userId)
    }));
  });

  useSocket('loungeDeleted', () => {
    alert('This lounge has been deleted by the creator');
    navigate('/dashboard');
  });

  const handleLeave = async () => {
    try {
      await loungeAPI.leave(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to leave lounge:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lounge?')) {
      try {
        await loungeAPI.delete(id);
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete lounge:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-xl text-spotify-lightGray">Loading lounge...</p>
        </div>
      </div>
    );
  }

  if (!lounge) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-spotify-gray rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{lounge.name}</h1>
            <p className="text-spotify-lightGray">
              Lounge Code: <span className="font-mono font-bold text-spotify-green">{lounge.code}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              Leave
            </button>
            {lounge.creator._id === lounge.members[0]?._id && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition"
              >
                Delete Lounge
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-spotify-lightGray">
            {lounge.members.length} {lounge.members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Player & Playlist */}
        <div className="lg:col-span-2">
          <Player loungeId={id} playlist={playlist} setPlaylist={setPlaylist} />
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <ChatBox loungeId={id} members={lounge.members} />
        </div>
      </div>
    </div>
  );
};

export default LoungeRoom;