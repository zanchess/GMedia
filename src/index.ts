import 'reflect-metadata';
import Fastify from 'fastify';
import { container } from 'tsyringe';
import { MongoDBService } from './services/mongodb.service';
import { taskController } from './controller/task.controller';
import { RabbitMQService } from './services/rabbitmq.service';
import { TaskConsumerService } from './services/task-consumer.service';
import { ControllerBase } from './controller/baseController';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import fastifyApollo from '@as-integrations/fastify';
import { readFileSync } from 'fs';
import { resolvers } from './graphql/resolvers';
import path from 'path';

dotenv.config();
const app = Fastify();

async function start() {
  const mongoDBService = container.resolve(MongoDBService);
  const rabbitMQService = container.resolve(RabbitMQService);
  const taskConsumerService = container.resolve(TaskConsumerService);

  await mongoDBService.connect();
  await rabbitMQService.connect();
  await taskConsumerService.consumeTaskActions();

  const typeDefs = readFileSync(path.join(__dirname, 'graphql', 'schema.graphql'), 'utf-8');
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();
  await app.register(fastifyApollo(apolloServer));

  const controllers: ControllerBase[] = [taskController];
  controllers.forEach((controller) => {
    controller.registerRoute(app);
  });

  app.listen({ port: 3000, host: 'localhost' }, (err: any, address: any) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    console.log('GraphQL endpoint available at http://localhost:3000/graphql');
  });
}

start();
