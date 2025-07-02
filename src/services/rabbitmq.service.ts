import * as amqp from 'amqplib';
import { RABBITMQ_VALUE } from '../enum/rabbitmq-value.enum';

export class RabbitMQService {
  private static connection: amqp.ChannelModel;
  static channel: amqp.Channel;

  static async connect() {
    const RABBITMQ_URL = process.env.RABBITMQ_URL!;

    if (!RabbitMQService.connection) {
      RabbitMQService.connection = await amqp.connect(String(RABBITMQ_URL));

      RabbitMQService.channel = await this.connection.createChannel();

      await this.channel.assertExchange(RABBITMQ_VALUE.TASK_EXCHANGE, 'direct', { durable: true });
      await this.channel.assertQueue(RABBITMQ_VALUE.TASK_QUEUE, { durable: true });
      await this.channel.bindQueue(
        RABBITMQ_VALUE.TASK_QUEUE,
        RABBITMQ_VALUE.TASK_EXCHANGE,
        RABBITMQ_VALUE.TASK_ROUTING_KEY,
      );
      console.log('Connected to RabbitMQ, exchange and queue are set up');
    }
    return RabbitMQService.channel;
  }

  static async publishTaskAction(taskId: string, action: 'created' | 'updated') {
    if (!RabbitMQService.channel) await this.connect();
    const msg = {
      taskId,
      action,
      timestamp: new Date().toISOString(),
    };
    RabbitMQService.channel.publish(
      RABBITMQ_VALUE.TASK_EXCHANGE,
      RABBITMQ_VALUE.TASK_ROUTING_KEY,
      Buffer.from(JSON.stringify(msg)),
    );
  }
}
