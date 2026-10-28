import { ensureIndexes } from '../lib/db/indexes';
import { getMongoClient } from '../lib/db/mongodb';

async function main() {
  console.log('Ensuring all database indexes...');
  await ensureIndexes();
  const client = await getMongoClient();
  await client.close();
  console.log('Indexes created successfully.');
}

main().catch(err => {
  console.error('Index setup error:', err);
  process.exit(1);
});
