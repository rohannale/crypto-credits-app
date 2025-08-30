const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Webhook Endpoint', () => {
  let testUser;
  const testWalletAddress = '0x742d35Cc6644c002532c692aF58B11306b2ea524';
  const receivingWallet = process.env.RECEIVING_WALLET;

  beforeEach(async () => {
    // Create test user with wallet
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      walletAddress: testWalletAddress.toLowerCase(),
      credits: 50
    });
  });

  const createValidWebhookPayload = (overrides = {}) => {
    return {
      event: {
        network: 'ETH_SEPOLIA',
        activity: [{
          fromAddress: testWalletAddress,
          toAddress: receivingWallet,
          value: 0.01,
          hash: '0x123456789abcdef',
          asset: 'ETH',
          ...overrides.activity
        }],
        ...overrides.event
      },
      ...overrides
    };
  };

  describe('POST /api/webhook', () => {
    it('should process valid webhook and add credits', async () => {
      const payload = createValidWebhookPayload();
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Verify credits were added
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(150); // 50 + 100 (for 0.01 ETH)
    });

    it('should add correct credits for 0.001 ETH', async () => {
      const payload = createValidWebhookPayload({
        activity: { value: 0.001 }
      });
      
      await request(app)
        .post('/api/webhook')
        .send(payload);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(60); // 50 + 10
    });

    it('should add correct credits for 0.05 ETH', async () => {
      const payload = createValidWebhookPayload({
        activity: { value: 0.05 }
      });
      
      await request(app)
        .post('/api/webhook')
        .send(payload);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(550); // 50 + 500
    });

    it('should add correct credits for 0.1 ETH', async () => {
      const payload = createValidWebhookPayload({
        activity: { value: 0.1 }
      });
      
      await request(app)
        .post('/api/webhook')
        .send(payload);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(1050); // 50 + 1000
    });

    it('should ignore webhook for wrong network', async () => {
      const payload = createValidWebhookPayload({
        event: { network: 'ETH_MAINNET' }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should ignore webhook for wrong recipient', async () => {
      const payload = createValidWebhookPayload({
        activity: { toAddress: '0x999999999999999999999999999999999999999' }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should ignore webhook for wrong asset', async () => {
      const payload = createValidWebhookPayload({
        activity: { asset: 'USDC' }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should ignore webhook for zero value', async () => {
      const payload = createValidWebhookPayload({
        activity: { value: 0 }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should ignore webhook for negative value', async () => {
      const payload = createValidWebhookPayload({
        activity: { value: -0.01 }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should ignore webhook for unregistered wallet', async () => {
      const payload = createValidWebhookPayload({
        activity: { fromAddress: '0x999999999999999999999999999999999999999' }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should handle webhook with missing event', async () => {
      const payload = {};
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });

    it('should handle webhook with missing activity', async () => {
      const payload = {
        event: {
          network: 'ETH_SEPOLIA',
          activity: []
        }
      };
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });

    it('should handle case insensitive wallet addresses', async () => {
      const payload = createValidWebhookPayload({
        activity: { 
          fromAddress: testWalletAddress.toUpperCase(),
          toAddress: receivingWallet.toUpperCase()
        }
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should be added despite case differences
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(150);
    });

    it('should handle very small amounts below threshold', async () => {
      const payload = createValidWebhookPayload({
        activity: { value: 0.0005 } // Below minimum threshold
      });
      
      const response = await request(app)
        .post('/api/webhook')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');

      // Credits should remain unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(50);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/webhook')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // Express JSON parser throws SyntaxError which gets caught by global error handler
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});
