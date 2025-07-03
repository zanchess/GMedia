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

@injectable()
class TaskController implements ControllerBase {
  constructor(@inject(TaskService) private taskService: TaskService) {}

  async getTaskById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const task = await this.taskService.getTaskById(id);
      if (!task) return reply.code(ErrorCode.NOT_FOUND).send({ message: 'Task not found' });
      reply.code(ErrorCode.SUCCESS).send(task);
    } catch (e) {
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    }
  }

  async getTasks(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status } = request.query as { status?: TaskStatus };
      const tasks = await this.taskService.getTasks(status);
      reply.code(ErrorCode.SUCCESS).send({ data: tasks });
    } catch (e) {
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
    }
  }

  async createTask(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { title, description, status } = request.body as Omit<Task, 'id'>;
      const task = await this.taskService.createTask({ title, description, status });
      reply.code(ErrorCode.CREATED).send(task);
    } catch (e) {
      reply.code(ErrorCode.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
    }
  }

  async updateTask(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as UpdateTaskInput;
      const updatedTask = await this.taskService.updateTask(id, data);
      if (!updatedTask) return reply.code(ErrorCode.NOT_FOUND).send({ message: 'Task not found' });
      reply.code(ErrorCode.SUCCESS).send(updatedTask);
    } catch (e) {
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
