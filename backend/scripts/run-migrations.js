require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS pgmigrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');

      // Check if migration already ran
      const result = await client.query('SELECT name FROM pgmigrations WHERE name = $1', [migrationName]);

      if (result.rows.length === 0) {
        console.log(`Running migration: ${migrationName}`);

        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(migrationSQL);
          await client.query('INSERT INTO pgmigrations (name) VALUES ($1)', [migrationName]);
          await client.query('COMMIT');
          console.log(`✅ Migration ${migrationName} completed`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else {
        console.log(`⏭️  Migration ${migrationName} already ran`);
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();