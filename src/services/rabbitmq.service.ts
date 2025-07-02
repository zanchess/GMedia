import * as amqp from 'amqplib';
import { RABBITMQ_VALUE } from '../enum/rabbitmq-value.enum';

export class RabbitMQService {
  private static connection: amqp.ChannelModel;
  private static channel: amqp.Channel;

  static async connect() {
    const RABBITMQ_URL = process.env.RABBITMQ_URL!;

    if (!this.connection) {
      this.connection = await amqp.connect(String(RABBITMQ_URL));

      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(RABBITMQ_VALUE.TASK_EXCHANGE, 'direct', { durable: true });
      await this.channel.assertQueue(RABBITMQ_VALUE.QUEUE, { durable: true });
      await this.channel.bindQueue(
        RABBITMQ_VALUE.QUEUE,
        RABBITMQ_VALUE.TASK_EXCHANGE,
        RABBITMQ_VALUE.ROUTING_KEY,
      );
      console.log('Connected to RabbitMQ, exchange and queue are set up');
    }
    return this.channel;
  }

  static async publishTaskAction(taskId: string, action: 'created' | 'updated') {
    if (!this.channel) await this.connect();
    const msg = {
      taskId,
      action,
      timestamp: new Date().toISOString(),
    };
    this.channel.publish(
      RABBITMQ_VALUE.TASK_EXCHANGE,
      RABBITMQ_VALUE.ROUTING_KEY,
      Buffer.from(JSON.stringify(msg)),
    );
  }
}
