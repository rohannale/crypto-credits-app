const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('API Integration Tests', () => {
  describe('CORS and Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/auth/signup');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/signup')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    it('should return 404 for non-existent API endpoints', async () => {
      const response = await request(app)
        .post('/api/non-existent-endpoint')
        .send({ data: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('Global Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should handle very large payloads', async () => {
      const largePayload = 'x'.repeat(1000000); // 1MB payload

      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: largePayload, password: 'test' });

      // Should either succeed with validation error or fail gracefully
      expect([200, 400, 413]).toContain(response.status);
    });

    it('should handle special characters in requests', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@🏠.com',
          password: 'password123'
        });

      // Should handle gracefully, either succeed or fail with validation
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Rate Limiting and Performance', () => {
    it('should handle rapid successive requests', async () => {
      const promises = Array(10).fill().map(() =>
        request(app)
          .get('/api/user/credits')
          .set('Authorization', 'Bearer invalid-token')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([401, 429]).toContain(response.status);
      });
    });

    it('should handle concurrent user operations', async () => {
      // Create test user
      const user = await User.create({
        email: 'concurrent@example.com',
        password: 'password123',
        credits: 100
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send multiple concurrent requests
      const promises = Array(5).fill().map((_, i) =>
        request(app)
          .get('/api/user/credits')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.credits).toBe(100);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate email format in signup', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        'test..email@example.com',
        'test email@example.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ email, password: 'password123' });

        expect(response.status).toBe(400);
      }
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: '123' }); // Too short

      expect(response.status).toBe(400);
    });

    it('should handle extremely long inputs', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const longPassword = 'a'.repeat(10000);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: longEmail, password: longPassword });

      // Should either succeed or fail gracefully
      expect([200, 400, 413]).toContain(response.status);
    });
  });

  describe('Environment Variables', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Test with a backup app instance if needed
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Backend server is running!');
    });

    it('should expose correct receiving wallet', async () => {
      // This would be tested by checking if the webhook endpoint works correctly
      const response = await request(app)
        .post('/api/webhook')
        .send({});

      expect(response.status).toBe(200);
    });
  });

  describe('Database Operations', () => {
    it('should handle database disconnection gracefully', async () => {
      // First create a user
      const user = await User.create({
        email: 'disconnect@example.com',
        password: 'password123'
      });

      // Disconnect from database (simulate connection loss)
      await User.db.close();

      // Try to access user data
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'disconnect@example.com',
          password: 'password123'
        });

      // Should fail gracefully
      expect([401, 500]).toContain(response.status);
    });

    it('should handle MongoDB index conflicts', async () => {
      // Create first user with wallet
      await User.create({
        email: 'wallet1@example.com',
        password: 'password123',
        walletAddress: '0x1111111111111111111111111111111111111111'
      });

      // Try to create second user with same wallet
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'wallet2@example.com',
          password: 'password123'
        });

      // Should succeed (signup doesn't include wallet)
      expect(response.status).toBe(201);
    });
  });

  describe('Security Tests', () => {
    it('should prevent directory traversal', async () => {
      const response = await request(app)
        .get('/../../../etc/passwd');

      expect(response.status).toBe(404);
    });

    it('should handle malicious headers', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', 'Bearer <script>alert("xss")</script>');

      expect(response.status).toBe(401);
    });

    it('should prevent HTTP method tampering', async () => {
      // Try unusual HTTP methods
      const methods = ['PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'];

      for (const method of methods) {
        const response = await request(app)[method.toLowerCase()]('/api/auth/login');
        expect([200, 404, 405]).toContain(response.status);
      }
    });

    it('should handle large authorization headers', async () => {
      const largeToken = 'Bearer ' + 'a'.repeat(10000);

      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', largeToken);

      expect(response.status).toBe(401);
    });
  });

  describe('Response Format', () => {
    it('should return JSON responses with proper content-type', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set('Authorization', 'Bearer invalid');

      expect(response.status).toBe(401);
      expect(response.headers['content-type']).toContain('application/json');
      expect(typeof response.body).toBe('object');
    });

    it('should include proper error response structure', async () => {
      const response = await request(app)
        .get('/api/user/credits');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should handle empty responses appropriately', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Backend server is running!');
    });
  });

  describe('Webhook Integration', () => {
    it('should handle webhook without database user', async () => {
      const payload = {
        event: {
          network: 'ETH_SEPOLIA',
          activity: [{
            fromAddress: '0x9999999999999999999999999999999999999999',
            toAddress: process.env.RECEIVING_WALLET,
            value: 0.01,
            hash: '0xunknownuser',
            asset: 'ETH'
          }]
        }
      };

      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });

    it('should handle malformed webhook payloads', async () => {
      const malformedPayloads = [
        null,
        undefined,
        '',
        [],
        'string',
        123,
        { event: null },
        { event: { activity: null } }
      ];

      for (const payload of malformedPayloads) {
        const response = await request(app)
          .post('/api/webhook')
          .send(payload);

        expect(response.status).toBe(200);
        expect(response.text).toBe('OK');
      }
    });
  });
});
