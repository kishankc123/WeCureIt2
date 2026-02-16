import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

if (!globalThis.pgClient) {
  globalThis.pgClient = client.connect().then(() => client).catch(err => {
    console.error("Failed to connect to DB:", err);
    throw err;
  });
}

export default await globalThis.pgClient;
