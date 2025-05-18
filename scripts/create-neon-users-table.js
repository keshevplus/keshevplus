require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function setupUsersTable() {
  console.log('Setting up users table in Neon PostgreSQL database...');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Check if users table exists
    console.log('Checking if users table exists...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `;
    
    if (tableCheck[0].exists) {
      console.log('✅ Users table already exists');
    } else {
      console.log('Creating users table...');
      await sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          role VARCHAR(20) DEFAULT 'user' NOT NULL,
          is_admin BOOLEAN DEFAULT false
        )
      `;
      console.log('✅ Users table created successfully');
    }
    
    // Create default admin user if no users exist
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
    
    if (usersCount[0].count === '0') {
      console.log('Creating default admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      await sql`
        INSERT INTO users (username, email, password, role, is_admin) 
        VALUES ('admin', 'dr@keshevplus.co.il', ${hashedPassword}, 'admin', true)
      `;
      
      console.log('✅ Default admin user created with:');
      console.log('Username: admin');
      console.log('Email: dr@keshevplus.co.il');
      console.log('Password: Admin123!');
      console.log('\nPlease change this password immediately after logging in!');
    } else {
      console.log(`There are already ${usersCount[0].count} user(s) in the database.`);
      
      // Check if the specific admin user already exists
      const adminExists = await sql`
        SELECT COUNT(*) as count FROM users WHERE username = 'admin'
      `;
      
      if (adminExists[0].count === '0') {
        console.log('Creating admin user...');
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin123!', salt);
        
        await sql`
          INSERT INTO users (username, email, password, role, is_admin) 
          VALUES ('admin', 'dr@keshevplus.co.il', ${hashedPassword}, 'admin', true)
        `;
        
        console.log('✅ Admin user created with:');
        console.log('Username: admin');
        console.log('Email: dr@keshevplus.co.il');
        console.log('Password: Admin123!');
        console.log('\nPlease change this password immediately after logging in!');
      } else {
        console.log('Admin user already exists.');
      }
    }
    
    console.log('\nUsers setup complete!');
  } catch (error) {
    console.error('Error setting up users table:', error);
  }
}

setupUsersTable().catch(err => console.error('Unhandled error:', err));
