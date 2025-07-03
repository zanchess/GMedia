import {
  Resolvers,
  TaskStatus,
  Task as GQLTask,
  MutationCreateTaskArgs,
  MutationUpdateTaskArgs,
  QueryTaskArgs,
  QueryTasksArgs,
} from './generated-types';
import { container } from 'tsyringe';
import { TaskService } from '../services/task.service';
import { Task } from '../interface/task.interface';

const taskService = container.resolve(TaskService);

function mapTaskToGQL(task: Task): GQLTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: task.status as TaskStatus,
  };
}

export const resolvers: Resolvers = {
  Query: {
    task: async (_, { id }: QueryTaskArgs): Promise<GQLTask | null> => {
      const task = await taskService.getTaskById(id);
      return task ? mapTaskToGQL(task) : null;
    },
    tasks: async (_, { status }: QueryTasksArgs): Promise<GQLTask[]> => {
      const tasks = await taskService.getTasks(status ?? undefined);
      return tasks.map(mapTaskToGQL);
    },
  },
  Mutation: {
    createTask: async (
      _,
      { title, description, status }: MutationCreateTaskArgs,
    ): Promise<GQLTask> => {
      return mapTaskToGQL(
        await taskService.createTask({
          title,
          description,
          status,
        }),
      );
    },
    updateTask: async (_, { id, title, description, status }: MutationUpdateTaskArgs) => {
      const taskToUpdate: Partial<Omit<Task, 'id'>> = {
        ...(title !== undefined && title !== null && { title }),
        ...(description !== undefined && description !== null && { description }),
        ...(status !== undefined && status !== null && { status }),
      };
      const updatedTask = await taskService.updateTask(id, taskToUpdate);

      return updatedTask ? mapTaskToGQL(updatedTask) : null;
    },
  },
};
