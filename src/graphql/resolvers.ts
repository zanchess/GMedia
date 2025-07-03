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
import { logger } from '../logger';

const taskService = container.resolve(TaskService);

function mapTaskToGQL(task: Task): GQLTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    dueDate: task.dueDate,
    status: task.status as TaskStatus,
  };
}

export const resolvers: Resolvers = {
  Query: {
    task: async (_, { id }: QueryTaskArgs): Promise<GQLTask | null> => {
      logger.info('GraphQL Query: task', { id });
      try {
        const task = await taskService.getTaskById(id);
        if (task) {
          logger.info('Task found', { id });
          return mapTaskToGQL(task);
        } else {
          logger.warn('Task not found', { id });
          return null;
        }
      } catch (e) {
        logger.error('Error in Query.task', { error: e, id });
        throw e;
      }
    },
    tasks: async (_, { status }: QueryTasksArgs): Promise<GQLTask[]> => {
      logger.info('GraphQL Query: tasks', { status });
      try {
        const tasks = await taskService.getTasks(status ?? undefined);
        logger.info('Tasks found', { count: tasks.length });

        return tasks.map(mapTaskToGQL);
      } catch (e) {
        logger.error('Error in Query.tasks', { error: e, status });
        throw e;
      }
    },
  },
  Mutation: {
    createTask: async (
      _,
      { title, description, dueDate, status }: MutationCreateTaskArgs,
    ): Promise<GQLTask> => {
      logger.info('GraphQL Mutation: createTask', { title, description, dueDate, status });
      try {
        if (!title || title.length < 1 || title.length > 100) {
          throw new Error('Title must be 1..100 characters long');
        }
        if (description && (description.length < 1 || description.length > 500)) {
          throw new Error('Description must be 1..500 characters long');
        }
        if (status && !['pending', 'in_progress', 'done'].includes(status)) {
          throw new Error('Invalid status value');
        }

        const created = await taskService.createTask({
          title,
          dueDate,
          description: description ?? undefined,
          status: status ?? 'pending',
        });
        logger.info('Task created', { id: created.id });

        return mapTaskToGQL(created);
      } catch (e) {
        logger.error('Error in Mutation.createTask', {
          error: e,
          title,
          description,
          dueDate,
          status,
        });
        throw e;
      }
    },
    updateTask: async (_, { id, title, description, status }: MutationUpdateTaskArgs) => {
      logger.info('GraphQL Mutation: updateTask', { id, title, description, status });
      try {
        if (typeof title === 'string' && (title.length < 1 || title.length > 100)) {
          throw new Error('Title must be 1..100 characters long');
        }
        if (
          typeof description === 'string' &&
          (description.length < 1 || description.length > 500)
        ) {
          throw new Error('Description must be 1..500 characters long');
        }
        if (status && !['pending', 'in_progress', 'done'].includes(status)) {
          throw new Error('Invalid status value');
        }

        const taskToUpdate: Partial<Omit<Task, 'id'>> = {
          ...(title !== undefined && title !== null && { title }),
          ...(description !== undefined &&
            description !== null && { description: description ?? undefined }),
          ...(status !== undefined && status !== null && { status }),
        };

        const updatedTask = await taskService.updateTask(id, taskToUpdate);
        if (updatedTask) {
          logger.info('Task updated', { id });

          return mapTaskToGQL(updatedTask);
        } else {
          logger.warn('Task not found for update', { id });
          return null;
        }
      } catch (e) {
        logger.error('Error in Mutation.updateTask', {
          error: e,
          id,
          title,
          description,
          status,
        });
        throw e;
      }
    },
  },
};
