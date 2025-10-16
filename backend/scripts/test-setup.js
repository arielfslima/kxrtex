#!/usr/bin/env node

/**
 * Test setup script
 * Prepares the test environment and runs tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Setting up test environment...\n');

// Check if test environment file exists
const testEnvPath = path.join(__dirname, '..', '.env.test');
if (!fs.existsSync(testEnvPath)) {
  console.error('❌ .env.test file not found!');
  console.log('Please create .env.test with test database configuration.');
  process.exit(1);
}

// Check if test database is accessible
console.log('📊 Checking test database connection...');
try {
  // Load test environment
  require('dotenv').config({ path: testEnvPath });

  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database first
  });

  // Test connection
  pool.query('SELECT 1', (err) => {
    if (err) {
      console.error('❌ Cannot connect to PostgreSQL:', err.message);
      console.log('\nPlease ensure PostgreSQL is running and credentials are correct.');
      process.exit(1);
    }

    console.log('✅ Database connection successful');

    // Check if test database exists
    const testDbName = process.env.DB_NAME;
    pool.query(`SELECT 1 FROM pg_database WHERE datname = '${testDbName}'`, (err, result) => {
      if (err) {
        console.error('❌ Error checking test database:', err.message);
        process.exit(1);
      }

      if (result.rows.length === 0) {
        console.log(`📝 Creating test database: ${testDbName}`);
        pool.query(`CREATE DATABASE "${testDbName}"`, (err) => {
          if (err) {
            console.error('❌ Error creating test database:', err.message);
            process.exit(1);
          }
          console.log('✅ Test database created');
          pool.end();
          runTests();
        });
      } else {
        console.log('✅ Test database exists');
        pool.end();
        runTests();
      }
    });
  });

} catch (error) {
  console.error('❌ Error setting up test environment:', error.message);
  process.exit(1);
}

function runTests() {
  console.log('\n🚀 Running tests...\n');

  try {
    // Run Jest tests
    const testCommand = process.argv.includes('--watch') ? 'npm run test:watch' : 'npm test';
    execSync(testCommand, { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Tests failed');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test setup interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test setup terminated');
  process.exit(0);
});