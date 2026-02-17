const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME;

    // Check if database exists
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

createDatabase();
