import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Register = ({ onToggleView, onBackToHome }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(formData.email, formData.password);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onToggleView(); // Switch to login after successful registration
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-karma-black via-gray-900 to-karma-black">
        <div className="max-w-md w-full space-y-8 bg-karma-black/50 backdrop-blur-sm rounded-xl p-8 border border-karma-lime/20 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-karma-success" />
          <h2 className="text-2xl font-bold text-karma-white">Registration Successful!</h2>
          <p className="text-gray-300">You will be redirected to the login page shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-karma-black via-gray-900 to-karma-black flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-karma-lime/5 to-karma-success/5 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-karma-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold text-karma-white mb-4">KARMA</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Join the digital revolution. Transform your luck with blockchain-powered fortune tokens.
            </p>
          </div>

          <div className="bg-karma-lime/5 border border-karma-lime/20 rounded-xl p-6">
            <h3 className="text-karma-lime font-semibold mb-3">Why Join Karma?</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-center">
                <span className="text-karma-success mr-2">•</span>
                Digital good luck tokens
              </li>
              <li className="flex items-center">
                <span className="text-karma-success mr-2">•</span>
                Instant fortune activation
              </li>
              <li className="flex items-center">
                <span className="text-karma-success mr-2">•</span>
                Join 50,000+ lucky users
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-karma-black/50 backdrop-blur-sm border border-karma-lime/20 rounded-2xl p-8">
          {/* Back Button */}
          <div className="flex items-center justify-start mb-6">
            <button
              onClick={() => onBackToHome && onBackToHome()}
              className="flex items-center text-gray-400 hover:text-karma-lime transition-colors duration-200 group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-karma-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-400">
              Join the Karma revolution
            </p>
          </div>
        
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center">
                <span className="text-lg mr-2">!</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-karma-white font-medium text-sm mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-karma-black/30 border border-karma-lime/20 text-karma-white rounded-lg focus:outline-none focus:ring-1 focus:ring-karma-lime focus:border-karma-lime/50 placeholder-gray-400 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-karma-white font-medium text-sm mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-karma-black/30 border border-karma-lime/20 text-karma-white rounded-lg focus:outline-none focus:ring-1 focus:ring-karma-lime focus:border-karma-lime/50 placeholder-gray-400 pr-12 transition-all"
                placeholder="Password (min. 6 characters)"
              />
              <button
                type="button"
                className="absolute right-3 top-10 flex items-center text-gray-400 hover:text-karma-lime transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-karma-white font-medium text-sm mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-karma-black/30 border border-karma-lime/20 text-karma-white rounded-lg focus:outline-none focus:ring-1 focus:ring-karma-lime focus:border-karma-lime/50 placeholder-gray-400 pr-12 transition-all"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-3 top-10 flex items-center text-gray-400 hover:text-karma-lime transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-karma-lime text-karma-black py-3 px-6 rounded-lg font-semibold hover:bg-karma-success transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-karma-black mr-3"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center pt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onToggleView}
                  className="text-karma-lime hover:text-karma-success transition-colors font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
