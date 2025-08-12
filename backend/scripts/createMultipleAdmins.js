const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdminUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`User with email ${userData.email} already exists.`);
      return existingUser;
    }

    // Create new admin user
    const user = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role
    });

    await user.save();
    console.log(`${userData.role} created successfully:`, {
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role
    });
    
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

const createAllAdmins = async () => {
  try {
    console.log('Creating admin users for DocumentorV3 system...\n');

    // Create Super Admin
    await createAdminUser({
      firstName: 'Super',
      lastName: 'Administrator',
      email: 'superadmin@eltnhs.edu.ph',
      password: 'SuperAdmin123!',
      role: 'super-admin'
    });

    // Create Document Admin
    await createAdminUser({
      firstName: 'Document',
      lastName: 'Administrator',
      email: 'docadmin@eltnhs.edu.ph',
      password: 'DocAdmin123!',
      role: 'admin-document'
    });

    // Create Enrollment Admin
    await createAdminUser({
      firstName: 'Enrollment',
      lastName: 'Administrator',
      email: 'enrolladmin@eltnhs.edu.ph',
      password: 'EnrollAdmin123!',
      role: 'admin-enrollment'
    });

    // Create Legacy Admin (backwards compatibility)
    await createAdminUser({
      firstName: 'Legacy',
      lastName: 'Administrator',
      email: 'admin@eltnhs.edu.ph',
      password: 'Admin123!',
      role: 'admin'
    });

    console.log('\n=== Admin Users Created Successfully ===');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('');
    console.log('👑 SUPER ADMINISTRATOR');
    console.log('   Email: superadmin@eltnhs.edu.ph');
    console.log('   Password: SuperAdmin123!');
    console.log('   Access: Full system access, user management, settings');
    console.log('');
    console.log('📄 DOCUMENT ADMINISTRATOR');
    console.log('   Email: docadmin@eltnhs.edu.ph');
    console.log('   Password: DocAdmin123!');
    console.log('   Access: Document requests, inquiries, document archive');
    console.log('');
    console.log('🎓 ENROLLMENT ADMINISTRATOR');
    console.log('   Email: enrolladmin@eltnhs.edu.ph');
    console.log('   Password: EnrollAdmin123!');
    console.log('   Access: Student enrollments, enrollment archive');
    console.log('');
    console.log('⚙️  LEGACY ADMINISTRATOR');
    console.log('   Email: admin@eltnhs.edu.ph');
    console.log('   Password: Admin123!');
    console.log('   Access: General admin access (backwards compatibility)');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   - Change these passwords immediately after first login');
    console.log('   - Use strong, unique passwords for production');
    console.log('   - Enable two-factor authentication if available');
    console.log('   - Regularly review admin user access');
    console.log('');

  } catch (error) {
    console.error('Error creating admin users:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Function to create a single admin with custom details
const createCustomAdmin = async (role, email, firstName, lastName, password) => {
  try {
    console.log(`Creating custom ${role}...`);
    
    const user = await createAdminUser({
      firstName,
      lastName,
      email,
      password,
      role
    });

    console.log(`\n✅ Custom ${role} created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${firstName} ${lastName}`);
    
  } catch (error) {
    console.error('Error creating custom admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
  // Create all default admins
  createAllAdmins();
} else if (args.length === 5) {
  // Create custom admin: role email firstName lastName password
  const [role, email, firstName, lastName, password] = args;
  
  const validRoles = ['super-admin', 'admin-document', 'admin-enrollment', 'admin'];
  if (!validRoles.includes(role)) {
    console.error('❌ Invalid role. Valid roles are:', validRoles.join(', '));
    process.exit(1);
  }
  
  createCustomAdmin(role, email, firstName, lastName, password);
} else {
  console.log('Usage:');
  console.log('  Create all default admins: node createMultipleAdmins.js');
  console.log('  Create custom admin: node createMultipleAdmins.js <role> <email> <firstName> <lastName> <password>');
  console.log('');
  console.log('Valid roles: super-admin, admin-document, admin-enrollment, admin');
  console.log('');
  console.log('Example:');
  console.log('  node createMultipleAdmins.js admin-document jane.doe@school.edu Jane Doe MyPassword123!');
  process.exit(1);
}
