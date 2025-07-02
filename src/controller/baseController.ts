import { FastifyInstance } from 'fastify';

export abstract class ControllerBase {
  abstract registerRoute(app: FastifyInstance): Promise<void>;
}
