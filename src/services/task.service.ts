import { ObjectId } from 'mongodb';
import { injectable, inject } from 'tsyringe';
import { MongoDBService } from './mongodb.service';
import {
  CreateTaskInput,
  Task,
  TaskDB,
  TaskStatus,
  UpdateTaskInput,
} from '../interface/task.interface';
import { RabbitMQService } from './rabbitmq.service';
import { TaskModel } from '../models/task.model';

@injectable()
export class TaskService {
  private collectionName = 'tasks';

  constructor(
    @inject(MongoDBService) private mongoDBService: MongoDBService,
    @inject(RabbitMQService) private rabbitMQService: RabbitMQService,
  ) {}

  async getTaskById(id: string): Promise<Task | null> {
    const db = this.mongoDBService.getDb();
    const doc = await db.collection(this.collectionName).findOne({ _id: new ObjectId(id) });
    return doc ? this.mapDocToTask(doc as unknown as TaskDB) : null;
  }

  async getTasks(status?: TaskStatus): Promise<Task[]> {
    const db = this.mongoDBService.getDb();
    const filter = status ? { status } : {};
    const docs = (await db
      .collection(this.collectionName)
      .find(filter)
      .toArray()) as unknown as TaskDB[];
    return docs.map(this.mapDocToTask);
  }

  async createTask(data: CreateTaskInput): Promise<Task> {
    const taskToSave = new TaskModel(data).toDocumentCreate();

    const db = this.mongoDBService.getDb();
    const result = await db.collection(this.collectionName).insertOne(taskToSave);
    const task = { ...taskToSave, id: result.insertedId.toHexString() };

    await this.rabbitMQService.publishTaskAction(task.id, 'created');
    return this.mapDocToTask(task as unknown as TaskDB);
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
    const taskToUpdate = new TaskModel(data).toDocumentUpdate();

    const db = this.mongoDBService.getDb();
    const updatedTask = await db
      .collection(this.collectionName)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: taskToUpdate },
        { returnDocument: 'after' },
      );

    if (updatedTask) {
      const taskResponse = this.mapDocToTask(updatedTask as unknown as TaskDB);
      await this.rabbitMQService.publishTaskAction(taskResponse.id, 'updated');
      return taskResponse;
    }
    return null;
  }

  private mapDocToTask(doc: TaskDB): Task {
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toHexString() };
  }
}
