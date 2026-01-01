import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    await auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear all local storage
  localStorage.clear();
  
  // Call logout from context
  logout();
  
  // Force page reload to clear all state
  window.location.href = '/';
};

  return (
    <nav className="bg-spotify-black border-b border-spotify-gray">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold text-white">Music Room</span>
          </Link>

          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-spotify-lightGray hover:text-white transition"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(user.displayName)} text-white font-semibold text-sm`}>
                    {getInitials(user.displayName)}
                  </div>
                )}
                <span className="text-white font-medium hidden sm:block">
                  {user.displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-spotify-lightGray hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;