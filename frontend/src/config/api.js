// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
  },
  USER: {
    CREDITS: '/api/user/credits',
    WALLET: '/api/user/wallet',
  },
  WEBHOOK: '/api/webhook',
};

export default API_BASE_URL;
