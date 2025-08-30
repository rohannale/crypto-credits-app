const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Only connect to MongoDB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
}

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Manual karma credit endpoint (fallback for webhook issues)
app.post('/api/manual-karma-credit', async (req, res) => {
  try {
    const { txHash, userEmail } = req.body;

    if (!txHash || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing txHash or userEmail'
      });
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has a wallet address
    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'User has no wallet address'
      });
    }

    // For now, add a default amount of karma (10 points for 0.001 ETH)
    // In production, you'd verify the actual transaction on the blockchain
    const karmaToAdd = 10;
    const oldBalance = user.credits;
    user.credits += karmaToAdd;

    await user.save();

    console.log('MANUAL KARMA CREDIT:');
    console.log('  User:', userEmail);
    console.log('  TxHash:', txHash);
    console.log('  Karma Added:', karmaToAdd);
    console.log('  New Balance:', user.credits);

    res.json({
      success: true,
      message: 'Karma credited successfully',
      data: {
        oldBalance,
        newBalance: user.credits,
        karmaAdded: karmaToAdd,
        txHash
      }
    });

  } catch (error) {
    console.error('Manual karma credit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint - Enhanced with better validation and logging
app.post('/api/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Full payload structure:', JSON.stringify(payload, null, 2));

    let event, tx, from, to, value, txHash, asset;

    // Handle different webhook payload structures
    if (payload.event) {
      // Alchemy Notify webhook format
      event = payload.event;
      if (event.network !== 'ETH_SEPOLIA') {
        console.log('Skipped: Invalid network:', event.network);
        return res.status(200).send('OK');
      }

      tx = event.activity && event.activity[0];
      if (!tx) {
        console.log('Skipped: No transaction activity in Alchemy format');
        return res.status(200).send('OK');
      }

      from = tx.fromAddress?.toLowerCase().trim();
      to = tx.toAddress?.toLowerCase().trim();
      value = parseFloat(tx.value);
      txHash = tx.hash?.trim();
      asset = tx.asset;

    } else if (payload.params && payload.params.result) {
      // Direct blockchain RPC format (for testing)
      console.log('Detected direct RPC format');
      const result = payload.params.result;
      // This is a simplified handling - in production you'd parse the actual transaction
      return res.status(200).send('OK');

    } else {
      // Unknown payload format
      console.log('Skipped: Unknown payload format');
      console.log('Payload keys:', Object.keys(payload));
      return res.status(200).send('OK');
    }

    console.log('Transaction Details:');
    console.log('  From:', from);
    console.log('  To:', to);
    console.log('  Value:', value, 'ETH');
    console.log('  Hash:', txHash);
    console.log('  Asset:', asset);

    // Comprehensive validation
    if (!from || !to || !txHash || !process.env.RECEIVING_WALLET) {
      console.log('Skipped: Missing required fields');
      return res.status(200).send('OK');
    }

    if (to !== process.env.RECEIVING_WALLET.toLowerCase()) {
      console.log('Skipped: Transaction not to receiving wallet');
      console.log('  Expected:', process.env.RECEIVING_WALLET.toLowerCase());
      console.log('  Received:', to);
      return res.status(200).send('OK');
    }

    if (isNaN(value) || value <= 0) {
      console.log('Skipped: Invalid transaction value');
      return res.status(200).send('OK');
    }

    if (asset !== 'ETH') {
      console.log('Skipped: Invalid asset type');
      return res.status(200).send('OK');
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: from });
    if (!user) {
      console.log('Skipped: No user found with wallet address:', from);
      return res.status(200).send('OK');
    }

    console.log('Found user:', user.email, '(ID:', user._id, ')');

    // Calculate karma based on ETH amount
    let karmaToAdd = 0;
    if (value >= 0.1) karmaToAdd = 1000;
    else if (value >= 0.05) karmaToAdd = 500;
    else if (value >= 0.01) karmaToAdd = 100;
    else if (value >= 0.001) karmaToAdd = 10;

    console.log('Karma calculation:');
    console.log('  ETH amount:', value);
    console.log('  Karma to add:', karmaToAdd);
    console.log('  Current balance:', user.credits);

    if (karmaToAdd > 0) {
      const oldBalance = user.credits;
      user.credits += karmaToAdd;
      await user.save();

      console.log('SUCCESS: Karma updated!');
      console.log('  Previous balance:', oldBalance);
      console.log('  New balance:', user.credits);
      console.log('  Transaction:', txHash);
      console.log('  User:', user.email);
    } else {
      console.log('No karma added (amount too small)');
    }

    console.log('=== WEBHOOK PROCESSED ===\n');
    res.status(200).send('OK');

  } catch (err) {
    console.error('WEBHOOK ERROR:', err);
    console.error('Stack:', err.stack);
    res.status(400).send('Error processing webhook');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
