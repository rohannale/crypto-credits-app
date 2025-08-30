const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

describe('User Endpoints', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      credits: 100
    });

    // Create auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/user/credits', () => {
    it('should return user credits with valid token', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.credits).toBe(100);
    });

    it('should not return credits without token', async () => {
      const response = await request(app)
        .get('/api/user/credits');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should not return credits with invalid token', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should not return credits with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('POST /api/user/wallet', () => {
    const testWalletAddress = '0x742d35Cc6644c002532c692aF58B11306b2ea524';

    it('should update wallet address with valid token', async () => {
      const response = await request(app)
        .post('/api/user/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress: testWalletAddress });

      expect(response.status).toBe(200);
      expect(response.body.walletAddress).toBe(testWalletAddress.toLowerCase());

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.walletAddress).toBe(testWalletAddress.toLowerCase());
    });

    it('should not update wallet without token', async () => {
      const response = await request(app)
        .post('/api/user/wallet')
        .send({ walletAddress: testWalletAddress });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should not update wallet with invalid token', async () => {
      const response = await request(app)
        .post('/api/user/wallet')
        .set('Authorization', 'Bearer invalid-token')
        .send({ walletAddress: testWalletAddress });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should handle missing wallet address', async () => {
      const response = await request(app)
        .post('/api/user/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.walletAddress).toBe(null);
    });

    it('should reject invalid wallet address format', async () => {
      const response = await request(app)
        .post('/api/user/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress: 'invalid-address' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid wallet address format');
    });

    it('should allow updating wallet address multiple times', async () => {
      const firstAddress = '0x742d35Cc6644c002532c692aF58B11306b2ea524';
      const secondAddress = '0x8ba1f109551bD432803012645aac136c5020B9BD';

      // First update
      await request(app)
        .post('/api/user/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress: firstAddress });

      // Second update
      const response = await request(app)
        .post('/api/user/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress: secondAddress });

      expect(response.status).toBe(200);
      expect(response.body.walletAddress).toBe(secondAddress.toLowerCase());
    });
  });
});
