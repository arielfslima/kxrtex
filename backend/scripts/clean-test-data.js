#!/usr/bin/env node

/**
 * Clean test data script
 * Removes all test data from the test database
 */

require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/models');
const redisClient = require('../src/config/redis');

async function cleanTestData() {
  try {
    console.log('🧹 Cleaning test data...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to test database');

    // Drop all tables and recreate them
    await sequelize.drop({ cascade: true });
    console.log('✅ Dropped all tables');

    await sequelize.sync({ force: true });
    console.log('✅ Recreated tables');

    // Clear Redis cache
    if (redisClient.flushdb) {
      await redisClient.flushdb();
      console.log('✅ Cleared Redis cache');
    }

    console.log('\n🎉 Test data cleaned successfully!');

  } catch (error) {
    console.error('❌ Error cleaning test data:', error);
    process.exit(1);
  } finally {
    // Close connections
    await sequelize.close();
    if (redisClient.quit) {
      await redisClient.quit();
    }
  }
}

// Run the cleanup
cleanTestData();