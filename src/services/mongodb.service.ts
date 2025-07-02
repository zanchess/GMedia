import { MongoClient, Db } from 'mongodb';
import { singleton } from 'tsyringe';

@singleton()
export class MongoDBService {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  async connect() {
    const MONGO_URI = process.env.MONGO_URI;
    const DB_NAME = process.env.MONGO_DB;
    if (!MONGO_URI) throw new Error('MONGO_URI is not set in environment variables');
    if (!DB_NAME) throw new Error('MONGO_DB is not set in environment variables');
    if (!this.client) {
      this.client = new MongoClient(MONGO_URI);
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log('Connected to MongoDB');
    }
    return this.db;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }
}
