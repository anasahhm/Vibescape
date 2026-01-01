import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lounge } from '../services/api';
import CreateLounge from '../components/Lounge/CreateLounge';
import JoinLounge from '../components/Lounge/JoinLounge';
import LoungeList from '../components/Lounge/LoungeList';

const Dashboard = () => {
  const [myLounges, setMyLounges] = useState([]);
  const [allLounges, setAllLounges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLounges();
  }, []);

  const fetchLounges = async () => {
    try {
      const [myResponse, allResponse] = await Promise.all([
        lounge.getMyLounges(),
        lounge.getAll()
      ]);
      setMyLounges(myResponse.data.lounges);
      setAllLounges(allResponse.data.lounges);
    } catch (error) {
      console.error('Failed to fetch lounges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoungeCreated = (newLounge) => {
    setShowCreateModal(false);
    navigate(`/lounge/${newLounge._id}`);
  };

  const handleLoungeJoined = (joinedLounge) => {
    setShowJoinModal(false);
    navigate(`/lounge/${joinedLounge._id}`);
  };

  const handleLoungeClick = (loungeId) => {
    navigate(`/lounge/${loungeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-xl text-spotify-lightGray">Loading lounges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Music Lounges</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-spotify-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition"
          >
            Create Lounge
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-spotify-gray text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition"
          >
            Join with Code
          </button>
        </div>
      </div>

      {myLounges.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">My Lounges</h2>
          <LoungeList lounges={myLounges} onLoungeClick={handleLoungeClick} />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">All Active Lounges</h2>
        {allLounges.length > 0 ? (
          <LoungeList lounges={allLounges} onLoungeClick={handleLoungeClick} />
        ) : (
          <div className="text-center py-12 bg-spotify-gray rounded-lg">
            <p className="text-xl text-spotify-lightGray">No active lounges. Create one to get started!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateLounge
          onClose={() => setShowCreateModal(false)}
          onLoungeCreated={handleLoungeCreated}
        />
      )}

      {showJoinModal && (
        <JoinLounge
          onClose={() => setShowJoinModal(false)}
          onLoungeJoined={handleLoungeJoined}
        />
      )}
    </div>
  );
};

export default Dashboard;