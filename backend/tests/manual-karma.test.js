const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Manual Karma Credit Endpoint', () => {
  let testUser;

  beforeEach(async () => {
    // Create test user with wallet
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      walletAddress: '0x742d35Cc6644c002532c692aF58B11306b2ea524',
      credits: 50
    });
  });

  describe('POST /api/manual-karma-credit', () => {
    const validPayload = {
      txHash: '0x123456789abcdef',
      userEmail: 'test@example.com'
    };

    it('should successfully credit karma with valid data', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Karma credited successfully');
      expect(response.body.data.karmaAdded).toBe(10);
      expect(response.body.data.newBalance).toBe(60); // 50 + 10
      expect(response.body.data.oldBalance).toBe(50);
      expect(response.body.data.txHash).toBe(validPayload.txHash);
    });

    it('should reject request without txHash', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({ userEmail: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing txHash or userEmail');
    });

    it('should reject request without userEmail', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({ txHash: '0x123456789abcdef' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing txHash or userEmail');
    });

    it('should reject request with empty payload', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing txHash or userEmail');
    });

    it('should reject request for non-existent user', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: 'nonexistent@example.com'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should reject request for user without wallet address', async () => {
      // Create user without wallet
      await User.create({
        email: 'nowallet@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: 'nowallet@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User has no wallet address');
    });

    it('should handle case insensitive email matching', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: 'TEST@EXAMPLE.COM' // Different case
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle email with leading/trailing whitespace', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: '  test@example.com  ' // With whitespace
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle long transaction hashes', async () => {
      const longTxHash = '0x' + 'a'.repeat(64); // Valid 66-character hash

      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: longTxHash,
          userEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.txHash).toBe(longTxHash);
    });

    it('should handle short transaction hashes', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123',
          userEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle malformed transaction hashes', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: 'not-a-hash',
          userEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.txHash).toBe('not-a-hash');
    });

    it('should allow multiple credits to the same user', async () => {
      // First credit
      await request(app)
        .post('/api/manual-karma-credit')
        .send(validPayload);

      // Second credit
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x987654321fedcba',
          userEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newBalance).toBe(70); // 50 + 10 + 10
      expect(response.body.data.oldBalance).toBe(60);
    });

    it('should handle concurrent requests properly', async () => {
      // Send multiple concurrent requests
      const promises = Array(5).fill().map((_, i) =>
        request(app)
          .post('/api/manual-karma-credit')
          .send({
            txHash: `0x${i.toString().repeat(16)}`,
            userEmail: 'test@example.com'
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Final balance should be 50 + (5 * 10) = 100
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error by disconnecting
      await User.db.close();

      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: 'test@example.com'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed request body', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle null/undefined values in payload', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: null,
          userEmail: undefined
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing txHash or userEmail');
    });
  });

  describe('Security', () => {
    it('should not reveal user information in error messages', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: 'nonexistent@example.com'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
      // Should not reveal if email exists or not
      expect(response.body.error).not.toContain('nonexistent@example.com');
    });

    it('should handle SQL injection attempts in email field', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '0x123456789abcdef',
          userEmail: "test@example.com' OR '1'='1"
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle XSS attempts in txHash field', async () => {
      const response = await request(app)
        .post('/api/manual-karma-credit')
        .send({
          txHash: '<script>alert("xss")</script>',
          userEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.txHash).toBe('<script>alert("xss")</script>');
    });
  });
});
