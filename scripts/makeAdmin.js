require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Usage: node scripts/makeAdmin.js someone@example.com
// The email must belong to an account that already exists (sign up first,
// then run this to promote it).

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user found with email: ${email}. Sign up with this email first, then run this script.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();

  console.log(`${user.name} (${user.email}) is now an admin.`);
  await mongoose.disconnect();
}

makeAdmin().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
