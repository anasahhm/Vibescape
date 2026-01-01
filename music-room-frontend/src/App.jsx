import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Common/Navbar';
import LoadingScreen from './components/Common/LoadingScreen';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoungeRoom from './pages/LoungeRoom';
import AuthCallback from './pages/AuthCallback';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
          
          <div className={`min-h-screen bg-spotify-darkGray transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lounge/:id"
                element={
                  <ProtectedRoute>
                    <LoungeRoom />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;