import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required in .env.local');
}

console.log('Testing connection to:', connectionString);

const sql = postgres(connectionString, { max: 1, idle_timeout: 3 });

async function test() {
  try {
    const result = await sql`SELECT version()`;
    console.log('Connected successfully!', result);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    process.exit(0);
  }
}

test();
