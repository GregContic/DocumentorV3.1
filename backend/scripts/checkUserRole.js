const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const email = 'docadmin@eltnhs.edu.ph';

async function checkUserRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
    } else {
      console.log(`User: ${user.email}\nRole: ${user.role}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

checkUserRole();
