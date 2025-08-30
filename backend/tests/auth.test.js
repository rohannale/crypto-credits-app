const request = require('supertest');
const app = require('../app'); // We'll need to extract app from index.js
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      
      // Verify user was created in database
      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user.email).toBe(validUserData.email);
    });

    it('should not register user with duplicate email', async () => {
      // Create user first
      await User.create(validUserData);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already exists');
    });

    it('should not register user with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should not register user with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should not register user with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should hash the password before saving', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send(validUserData);

      const user = await User.findOne({ email: validUserData.email });
      expect(user.password).not.toBe(validUserData.password);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(async () => {
      // Create a user for login tests
      await User.create(userData);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe('string');
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: userData.password
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should not login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: userData.password });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should not login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });
  });
});
