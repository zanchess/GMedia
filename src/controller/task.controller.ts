import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service';
import { Task, TaskStatus, UpdateTaskInput } from '../interface/task.interface';
import {
  TaskSchema,
  IdParamSchema,
  StatusQuerySchema,
  UpdateTaskSchema,
} from '../schema/task.schema';
import { ErrorCode } from '../enum/error-code.enum';
import { ControllerBase } from './baseController';
import { injectable, inject, container } from 'tsyringe';
import { sanitizeInputBody } from '../middleware/sanitizeInputBody';
import { logger } from '../logger';

@injectable()
class TaskController implements ControllerBase {
  constructor(@inject(TaskService) private taskService: TaskService) {}

  async getTaskById(request: FastifyRequest, reply: FastifyReply) {
    logger.info('Received getTaskById request', { params: request.params });
    try {
      const { id } = request.params as { id: string };
      const task = await this.taskService.getTaskById(id);

      if (!task) {
        logger.warn(`Task not found: ${id}`);
        return reply.code(ErrorCode.NOT_FOUND).send({ message: 'Task not found' });
      }
      logger.info(`Task found: ${id}`);

      reply.code(ErrorCode.SUCCESS).send(task);
    } catch (e) {
      logger.error('Error in getTaskById', { error: e });
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    }
  }

  async getTasks(request: FastifyRequest, reply: FastifyReply) {
    logger.info('Received getTasks request', { query: request.query });
    try {
      const { status } = request.query as { status?: TaskStatus };
      const tasks = await this.taskService.getTasks(status);

      logger.info(`Found ${tasks.length} tasks`);

      reply.code(ErrorCode.SUCCESS).send({ data: tasks });
    } catch (e) {
      logger.error('Error in getTasks', { error: e });
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
    }
  }

  async createTask(request: FastifyRequest, reply: FastifyReply) {
    logger.info('Received createTask request', { body: request.body });
    try {
      const { title, description, status } = request.body as Omit<Task, 'id'>;
      const task = await this.taskService.createTask({ title, description, status });

      logger.info(`Task created with id: ${task.id}`);

      reply.code(ErrorCode.CREATED).send(task);
    } catch (e) {
      logger.error('Error in createTask', { error: e });
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
    }
  }

  async updateTask(request: FastifyRequest, reply: FastifyReply) {
    logger.info('Received updateTask request', { params: request.params, body: request.body });
    try {
      const { id } = request.params as { id: string };
      const data = request.body as UpdateTaskInput;

      const updatedTask = await this.taskService.updateTask(id, data);
      if (!updatedTask) {
        logger.warn(`Task not found for update: ${id}`);
        return reply.code(ErrorCode.NOT_FOUND).send({ message: 'Task not found' });
      }
      logger.info(`Task updated: ${id}`);

      reply.code(ErrorCode.SUCCESS).send(updatedTask);
    } catch (e) {
      logger.error('Error in updateTask', { error: e });
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
    }
  }

  async registerRoute(app: FastifyInstance) {
    app.get(
      '/task/:id',
      {
        schema: {
          params: IdParamSchema,
        },
      },
      this.getTaskById.bind(this),
    );

    app.get(
      '/tasks',
      {
        schema: {
          querystring: StatusQuerySchema,
        },
      },
      this.getTasks.bind(this),
    );

    app.post(
      '/task',
      {
        schema: {
          body: TaskSchema,
        },
        preHandler: sanitizeInputBody,
      },
      this.createTask.bind(this),
    );

    app.patch(
      '/task/:id',
      {
        schema: {
          params: IdParamSchema,
          body: UpdateTaskSchema,
        },
        preHandler: sanitizeInputBody,
      },
      this.updateTask.bind(this),
    );
  }
}

export const taskController = container.resolve(TaskController);
