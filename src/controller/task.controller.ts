import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TaskSchema, IdParamSchema, StatusQuerySchema } from '../schema/task.schema';
import { ControllerBase } from './baseController';

class TaskController implements ControllerBase {
  async getTaskById(request: FastifyRequest, reply: FastifyReply) {

  }

  async getTasks(request: FastifyRequest, reply: FastifyReply) {

  }

  async createTask(request: FastifyRequest, reply: FastifyReply) {

  }

  async updateTask(request: FastifyRequest, reply: FastifyReply) {

  }

  async registerRoute(app: FastifyInstance) {
    app.get(
      '/tasks/:id',
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
      '/tasks',
      {
        schema: {
          body: TaskSchema,
        },
      },
      this.createTask.bind(this),
    );

    app.patch(
      '/tasks/:id',
      {
        schema: {
          params: IdParamSchema,
          body: TaskSchema,
        },
      },
      this.updateTask.bind(this),
    );
  }
}

export const taskController = new TaskController();
