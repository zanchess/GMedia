import { ModelBase } from './baseModel';
import { CreateTaskInput, UpdateTaskInput } from '../interface/task.interface';

export class TaskModel extends ModelBase<CreateTaskInput, UpdateTaskInput> {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'done';

  constructor(data: CreateTaskInput | UpdateTaskInput) {
    super();
    this.title = data.title;
    this.description = data.description;
    this.dueDate = data.dueDate;
    this.status = data.status ?? 'pending';
  }

  toDocumentCreate(): CreateTaskInput {
    return {
      title: this.title!,
      dueDate: this.dueDate!,
      ...(this.description !== undefined && { description: this.description }),
      status: this.status ?? 'pending',
    };
  }

  toDocumentUpdate(): UpdateTaskInput {
    return {
      ...(this.title !== undefined && { title: this.title }),
      ...(this.dueDate !== undefined && { dueDate: this.dueDate }),
      ...(this.status !== undefined && { status: this.status }),
      ...(this.description !== undefined && { description: this.description }),
    };
  }
}
