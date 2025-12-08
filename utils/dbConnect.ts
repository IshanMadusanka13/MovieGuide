import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any)._mongooseCache || {
  conn: null,
  promise: null
};

if (process.env.NODE_ENV !== 'production') {
  (global as any)._mongooseCache = cached;
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {}).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
