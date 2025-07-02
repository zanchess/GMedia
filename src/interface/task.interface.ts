import { ObjectId } from 'mongodb';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
}

export type TaskDB = Omit<Task, 'id'> & { _id: ObjectId };
