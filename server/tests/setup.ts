import 'dotenv/config';

// Set a dummy DATABASE_URL for testing purposes if it's not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://user:password@host:port/database';
}
