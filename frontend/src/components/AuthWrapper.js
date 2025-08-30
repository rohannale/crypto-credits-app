import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthWrapper = ({ onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleView = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <Login onToggleView={toggleView} onBackToHome={onBackToHome} />
      ) : (
        <Register onToggleView={toggleView} onBackToHome={onBackToHome} />
      )}
    </>
  );
};

export default AuthWrapper;
