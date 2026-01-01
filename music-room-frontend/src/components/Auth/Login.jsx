import { useState } from 'react';
import { auth } from '../../services/api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await auth.getSpotifyAuthUrl();
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {error && (
        <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-spotify-green text-white text-lg px-12 py-4 rounded-full font-bold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            <span className="text-2xl">🎧</span>
            Login with Spotify
          </>
        )}
      </button>
      <p className="text-spotify-lightGray mt-4 text-sm">
        You'll need a Spotify account to use this app
      </p>
    </div>
  );
};

export default Login;