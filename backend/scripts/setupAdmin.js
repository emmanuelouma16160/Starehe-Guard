import dotenv from 'dotenv';
import mongoose from 'mongoose';
import supabase from '../src/config/supabase.js';
import User from '../src/models/User.js';

dotenv.config();

const promptForPassword = async () => {
  const readline = await import('node:readline/promises');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question('Enter the password for the super admin account: ');
    return answer.trim();
  } finally {
    rl.close();
  }
};

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@stasentry.com').toLowerCase();
    let adminPassword = (process.env.SUPER_ADMIN_PASSWORD || '').trim();

    if (!adminPassword) {
      adminPassword = await promptForPassword();
    }

    if (!adminPassword || adminPassword.length < 6) {
      console.error('❌ Password must be at least 6 characters.');
      process.exit(1);
    }

    console.log('🔍 Checking Supabase users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Cannot fetch Supabase users:', error.message);
      process.exit(1);
    }

    let supabaseUser = users.find((u) => u.email?.toLowerCase() === adminEmail);

    if (!supabaseUser) {
      console.log('⚠️ No Supabase user found. Creating one now...');
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: 'System Administrator',
          role: 'super_admin',
        },
      });

      if (createError) {
        console.error('❌ Could not create Supabase user:', createError.message);
        process.exit(1);
      }

      supabaseUser = data.user;
      console.log('✅ Supabase user created');
    } else {
      console.log('✅ Supabase user found');
    }

    const existingUser = await User.findOne({ supabaseId: supabaseUser.id });
    
    if (existingUser) {
      console.log('⚠️ Super admin already exists in MongoDB');
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const adminUser = await User.create({
      supabaseId: supabaseUser.id,
      name: 'System Administrator',
      email: adminEmail,
      role: 'super_admin',
      phone: '',
      isActive: true,
    });

    console.log('\n✅ Super admin setup complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     super_admin`);
    console.log('═══════════════════════════════════════════');
    console.log('  You can now login to the application');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

setupAdmin();