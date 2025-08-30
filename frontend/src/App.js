import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleSignIn = () => {
    setShowAuth(true);
  };

  const handleBuyNow = () => {
    setShowAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-karma-black via-gray-900 to-karma-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-karma-lime mx-auto mb-4"></div>
          <p className="text-karma-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  if (showAuth) {
    return <AuthWrapper onBackToHome={() => setShowAuth(false)} />;
  }

  return <LandingPage onSignIn={handleSignIn} onBuyNow={handleBuyNow} />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
