const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Clean up: close connection and stop mongod
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up: remove all data after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGO_URI = 'mongodb://test';
process.env.RECEIVING_WALLET = '0xFBA15121BA790D33386bFE937EF527995e87cb1f';
process.env.PORT = '5001';
