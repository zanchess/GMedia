import Fastify from 'fastify';
import { MongoDBService } from './services/mongodb.service';
import { taskController } from './controller/task.controller';
import { RabbitMQService } from './services/rabbitmq.service';
import { TaskConsumerService } from './services/task-consumer.service';
import { ControllerBase } from './controller/baseController';
import dotenv from 'dotenv';

const app = Fastify();
dotenv.config();

async function start() {
  await MongoDBService.connect();
  await RabbitMQService.connect();
  await TaskConsumerService.consumeTaskActions();

  const controllers: ControllerBase[] = [taskController];
  controllers.forEach((controller) => {
    controller.registerRoute(app);
  });

  app.listen({ port: 3000 }, (err: any, address: any) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

start();
