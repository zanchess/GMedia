import { ObjectId } from 'mongodb';
import { MongoDBService } from './mongodb.service';
import { Task, TaskDB, TaskStatus } from '../interface/task.interface';
import { RabbitMQService } from './rabbitmq.service';

export class TaskService {
  static collectionName = 'tasks';

  static async getTaskById(id: string): Promise<Task | null> {
    const db = MongoDBService.getDb();
    const doc = await db.collection(this.collectionName).findOne({ _id: new ObjectId(id) });
    return doc ? TaskService.mapDocToTask(doc as unknown as TaskDB) : null;
  }

  static async getTasks(status?: TaskStatus): Promise<Task[]> {
    const db = MongoDBService.getDb();
    const filter = status ? { status } : {};
    const docs = (await db
      .collection(this.collectionName)
      .find(filter)
      .toArray()) as unknown as TaskDB[];
    return docs.map(TaskService.mapDocToTask);
  }

  static async createTask(data: Omit<Task, 'id'>): Promise<Task> {
    const db = MongoDBService.getDb();
    const result = await db.collection(this.collectionName).insertOne(data);
    const task = { ...data, id: result.insertedId.toHexString() };
    await RabbitMQService.publishTaskAction(task.id, 'created');
    return TaskService.mapDocToTask(task as unknown as TaskDB);
  }

  static async updateTask(id: string, data: Partial<Omit<Task, 'id'>>): Promise<Task | null> {
    const db = MongoDBService.getDb();
    const updatedTask = await db
      .collection(this.collectionName)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data }, { returnDocument: 'after' });
    if (updatedTask) {
      await RabbitMQService.publishTaskAction(updatedTask.id, 'updated');
      return TaskService.mapDocToTask(updatedTask as unknown as TaskDB);
    }
    return null;
  }

  private static mapDocToTask(doc: TaskDB): Task {
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toHexString() };
  }
}
