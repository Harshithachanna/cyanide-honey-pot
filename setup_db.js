const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = 'postgresql://postgres:nishvarma_2007@db.kbmcvsbipgdcggpnopim.supabase.co:5432/postgres';

async function setup() {
  console.log('Connecting to postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected.');
    
    const schemaPath = path.join(__dirname, 'supabase', 'migrations', '001_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running migrations...');
    await client.query(sql);
    console.log('Migrations applied successfully.');
    
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Schema appears to already exist. Continuing...');
    } else {
      console.error('Migration error:', err);
      process.exit(1);
    }
  } finally {
    await client.end();
  }

  console.log('Setting up Super Admin...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sb = createClient(supabaseUrl, serviceKey);

  const adminEmail = 'admin@honeypot.local';
  const adminPassword = 'adminPassword123!';

  // Create auth user
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (authErr && !authErr.message.includes('already registered')) {
    console.error('Error creating admin user:', authErr);
    process.exit(1);
  }

  let authId;
  if (authData?.user) {
    authId = authData.user.id;
  } else {
    // try to get existing user
    const { data: usersList } = await sb.auth.admin.listUsers();
    const existing = usersList?.users.find(u => u.email === adminEmail);
    if (!existing) {
      console.error('Could not find or create admin auth user.');
      process.exit(1);
    }
    authId = existing.id;
  }

  // Set user role
  const { error: profileErr } = await sb
    .from('users')
    .insert([{
      auth_id: authId,
      email: adminEmail,
      role: 'SUPER_ADMIN'
    }]);

  if (profileErr && profileErr.code !== '23505') { // Ignore unique constraint if exists
    console.error('Error adding admin to users table:', profileErr);
    process.exit(1);
  }

  console.log('\n=======================================');
  console.log('SETUP COMPLETE:');
  console.log(`Admin Email: ${adminEmail}`);
  console.log(`Admin Password: ${adminPassword}`);
  console.log('=======================================\n');
}

setup();
