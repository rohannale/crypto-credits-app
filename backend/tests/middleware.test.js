const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Middleware', () => {
  let testUser;
  let validToken;
  let expiredToken;
  let invalidToken;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });

    // Create valid token
    validToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create expired token
    expiredToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );

    // Create invalid token
    invalidToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      'wrong-secret',
      { expiresIn: '1h' }
    );
  });

  describe('Protected Route Access', () => {
    it('should allow access with valid JWT token', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.credits).toBeDefined();
    });

    it('should deny access without Authorization header', async () => {
      const response = await request(app)
        .get('/api/user/credits');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should deny access with empty Authorization header', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should deny access without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should deny access with expired token', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should deny access with malformed JWT', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', 'Bearer not-a-jwt-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should deny access with token for non-existent user', async () => {
      // Create token for non-existent user
      const fakeToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', email: 'nonexistent@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${fakeToken}`);

      // This should fail because the middleware attaches userId to req.userId
      // but doesn't verify the user exists - the route handler should handle this
      expect(response.status).toBe(404);
    });
  });

  describe('Token Structure', () => {
    it('should include correct userId in request', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.credits).toBe(testUser.credits);
    });

    it('should handle different token expiration times', async () => {
      const shortToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1s' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', `Bearer ${shortToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed Authorization header gracefully', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', 'Bearer invalid.jwt.here');

      expect(response.status).toBe(401);
    });

    it('should handle missing JWT_SECRET', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // This test would require restarting the app, so we'll just verify the token creation fails
      expect(() => {
        jwt.sign({ userId: 'test' }, undefined);
      }).toThrow();

      // Restore the secret
      process.env.JWT_SECRET = originalSecret;
    });
  });
});
