import { ObjectId } from 'mongodb';

export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status?: TaskStatus;
}

export type TaskDB = Omit<Task, 'id'> & { _id: ObjectId };
export type CreateTaskInput = Omit<Task, 'id'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id'>>;
