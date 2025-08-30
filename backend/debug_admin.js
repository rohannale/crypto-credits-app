const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const adminUser = await User.findOne({ email: 'admin@karma.com' });
  console.log('=== ADMIN@KARMA.COM DEBUG ===');
  console.log('User exists:', !!adminUser);

  if (adminUser) {
    console.log('Credits:', adminUser.credits);
    console.log('Wallet:', adminUser.walletAddress);
    console.log('Password exists:', !!adminUser.password);
  } else {
    console.log('Creating admin@karma.com...');
    const newAdmin = new User({
      email: 'admin@karma.com',
      password: 'password123',
      walletAddress: '0x3b7a078cd25d5c437cf0e7501fd4d822ab7c6fb7',
      credits: 10
    });
    await newAdmin.save();
    console.log('✅ Admin account created with 10 karma!');
  }

  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
