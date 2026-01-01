import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/Auth/Login';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-spotify-green rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-12 animate-slideIn">
          <div className="text-8xl mb-6 animate-float">🎵</div>
          <h1 className="text-7xl font-bold text-white mb-4 tracking-tight gradient-text">
            Collaborative Music Room
          </h1>
          <p className="text-2xl text-spotify-lightGray mb-8 animate-fadeIn">
            Create virtual lounges, share tracks, and build playlists together
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-spotify-gray p-8 rounded-xl card-hover animate-slideInLeft group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎵</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-spotify-green transition-colors">Share Music</h3>
            <p className="text-spotify-lightGray">
              Search and add your favorite Spotify tracks to collaborative playlists
            </p>
          </div>
          
          <div className="bg-spotify-gray p-8 rounded-xl card-hover animate-slideIn group" style={{ animationDelay: '100ms' }}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-spotify-green transition-colors">Collaborate</h3>
            <p className="text-spotify-lightGray">
              Vote on songs and chat with friends in real-time music lounges
            </p>
          </div>
          
          <div className="bg-spotify-gray p-8 rounded-xl card-hover animate-slideInRight group" style={{ animationDelay: '200ms' }}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎧</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-spotify-green transition-colors">Discover</h3>
            <p className="text-spotify-lightGray">
              Explore new music through your friends' recommendations
            </p>
          </div>
        </div>

        <div className="animate-scaleIn">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default Home;