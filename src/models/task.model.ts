import { ModelBase } from './baseModel';
import { CreateTaskInput, UpdateTaskInput } from '../interface/task.interface';

export class TaskModel extends ModelBase<CreateTaskInput, UpdateTaskInput> {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'done';

  constructor(data: Partial<CreateTaskInput>) {
    super();
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
  }

  toDocumentCreate(): CreateTaskInput {
    return {
      title: this.title || '',
      description: this.description || '',
      status: this.status || 'pending',
    };
  }

  toDocumentUpdate(): UpdateTaskInput {
    return {
      ...(this.title !== undefined && { title: this.title }),
      ...(this.status !== undefined && { status: this.status }),
      ...(this.description !== undefined && { description: this.description }),
    };
  }
}
