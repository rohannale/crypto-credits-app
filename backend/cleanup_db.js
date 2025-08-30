const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function cleanupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);

    // Check for duplicate wallet addresses
    const walletAddresses = {};
    const duplicates = [];

    users.forEach(user => {
      if (user.walletAddress) {
        const addr = user.walletAddress.toLowerCase().trim();
        if (walletAddresses[addr]) {
          duplicates.push({
            address: addr,
            users: [walletAddresses[addr], user._id]
          });
        } else {
          walletAddresses[addr] = user._id;
        }
      }
    });

    console.log(`Found ${duplicates.length} duplicate wallet addresses`);

    if (duplicates.length > 0) {
      console.log('Duplicate wallet addresses:');
      duplicates.forEach(dup => {
        console.log(`  Address: ${dup.address}`);
        console.log(`  Users: ${dup.users.join(', ')}`);
      });

      // Remove duplicates (keep the first user, remove others with this wallet)
      for (const dup of duplicates) {
        const usersWithAddress = await User.find({ walletAddress: dup.address });
        // Keep the first user, remove wallet addresses from others
        for (let i = 1; i < usersWithAddress.length; i++) {
          console.log(`Removing wallet address from user: ${usersWithAddress[i]._id} (${usersWithAddress[i].email})`);
          await User.updateOne(
            { _id: usersWithAddress[i]._id },
            { $unset: { walletAddress: 1 } }
          );
        }
      }
    }

    // Drop and recreate the walletAddress index
    console.log('Dropping existing walletAddress index...');
    await User.collection.dropIndex('walletAddress_1').catch(err => {
      console.log('Index might not exist, continuing...');
    });

    console.log('Creating new walletAddress index...');
    await User.collection.createIndex(
      { walletAddress: 1 },
      { unique: true, sparse: true }
    );

    console.log('Database cleanup completed successfully!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupDatabase();
