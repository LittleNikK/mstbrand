import { MongoClient, Db } from 'mongodb';
import { env } from '@/lib/config/env';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
};

function getMongoUri(): string {
  return process.env.MONGODB_URI || env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
}

function getDatabaseName(): string {
  // 1. Explicitly specified in env
  if (process.env.MONGODB_DB_NAME && process.env.MONGODB_DB_NAME.trim()) {
    return process.env.MONGODB_DB_NAME.trim();
  }

  // 2. If MONGODB_URI contains a database name in the path (e.g. mongodb+srv://user:pass@host/dbname?params)
  const uri = getMongoUri();
  try {
    const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
    const pathDb = parsed.pathname.replace(/^\//, '').split('?')[0];
    if (pathDb && pathDb.trim()) {
      return pathDb.trim();
    }
  } catch {
    // Ignore URL parse errors
  }

  return 'mst_store';
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = getMongoUri();

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect().catch(err => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  // Production: connect lazily per request/lambda instance with auto-retry
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch(err => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }

  return global._mongoClientPromise;
}

export async function getDb(dbName?: string): Promise<Db> {
  const targetDb = dbName || getDatabaseName();
  const client = await getMongoClient();
  return client.db(targetDb);
}

export default getMongoClient;
