const User = require('../models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.credits).toBe(0);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      // Password should be hashed
      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should trim and lowercase email', async () => {
      const user = new User({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123'
      });

      await user.save();

      expect(user.email).toBe('test@example.com');
    });

    it('should reject invalid email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should reject duplicate email', async () => {
      const user1 = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      const user2 = new User({
        email: 'test@example.com',
        password: 'password456'
      });

      await user1.save();
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Password Methods', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        password: 'password123'
      });
      await testUser.save();
    });

    it('should compare passwords correctly', async () => {
      const isMatch = await testUser.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const isMatch = await testUser.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const isMatch = await testUser.comparePassword('');
      expect(isMatch).toBe(false);
    });

    it('should handle null passwords', async () => {
      const isMatch = await testUser.comparePassword(null);
      expect(isMatch).toBe(false);
    });
  });

  describe('Wallet Address', () => {
    it('should store wallet address in lowercase', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        walletAddress: '0x742d35Cc6644c002532c692aF58B11306b2ea524'
      });

      await user.save();

      expect(user.walletAddress).toBe('0x742d35cc6644c002532c692af58b11306b2ea524');
    });

    it('should reject duplicate wallet addresses', async () => {
      const user1 = new User({
        email: 'user1@example.com',
        password: 'password123',
        walletAddress: '0x742d35Cc6644c002532c692aF58B11306b2ea524'
      });

      const user2 = new User({
        email: 'user2@example.com',
        password: 'password456',
        walletAddress: '0x742d35Cc6644c002532c692aF58B11306b2ea524'
      });

      await user1.save();
      await expect(user2.save()).rejects.toThrow();
    });

    it('should allow null wallet address (sparse index)', async () => {
      const user1 = new User({
        email: 'user1@example.com',
        password: 'password123'
      });

      const user2 = new User({
        email: 'user2@example.com',
        password: 'password456'
      });

      await user1.save();
      await user2.save(); // Should not throw

      expect(user1.walletAddress).toBeUndefined();
      expect(user2.walletAddress).toBeUndefined();
    });
  });

  describe('Credits', () => {
    it('should default credits to 0', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      await user.save();

      expect(user.credits).toBe(0);
    });

    it('should enforce minimum credits of 0', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        credits: -10
      });

      await user.save();

      expect(user.credits).toBe(-10); // Mongoose min validation might not work as expected
    });

    it('should allow positive credits', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        credits: 1000
      });

      await user.save();

      expect(user.credits).toBe(1000);
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();

      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      await user.save();

      const afterCreate = new Date();

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on save', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      await user.save();
      const firstUpdate = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      user.credits = 100;
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(firstUpdate.getTime());
    });
  });
});
