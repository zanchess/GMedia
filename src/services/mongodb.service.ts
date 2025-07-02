import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'test';

export class MongoDBService {
  private static client: MongoClient;
  private static db: Db;

  static async connect() {
    if (!this.client) {
      MongoDBService.client = new MongoClient(MONGO_URI);
      await MongoDBService.client.connect();
      this.db = MongoDBService.client.db(DB_NAME);
      console.log('Connected to MongoDB');
    }
    return MongoDBService.db;
  }

  static getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }
}
