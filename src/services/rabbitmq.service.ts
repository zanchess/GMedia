import * as amqp from 'amqplib';
import { RABBITMQ_VALUE } from '../enum/rabbitmq-value.enum';
import { singleton } from 'tsyringe';

@singleton()
export class RabbitMQService {
  private connection: amqp.ChannelModel | undefined;
  private channel: amqp.Channel | undefined;

  async connect() {
    const RABBITMQ_URL = process.env.RABBITMQ_URL!;
    if (!this.connection) {
      this.connection = await amqp.connect(String(RABBITMQ_URL));
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(RABBITMQ_VALUE.TASK_EXCHANGE, 'direct', { durable: true });
      await this.channel.assertQueue(RABBITMQ_VALUE.TASK_QUEUE, { durable: true });
      await this.channel.bindQueue(
        RABBITMQ_VALUE.TASK_QUEUE,
        RABBITMQ_VALUE.TASK_EXCHANGE,
        RABBITMQ_VALUE.TASK_ROUTING_KEY,
      );
      console.log('Connected to RabbitMQ, exchange and queue are set up');
    }
    return this.channel;
  }

  async publishTaskAction(taskId: string, action: 'created' | 'updated') {
    if (!this.channel) await this.connect();
    const msg = {
      taskId,
      action,
      timestamp: new Date().toISOString(),
    };
    this.channel!.publish(
      RABBITMQ_VALUE.TASK_EXCHANGE,
      RABBITMQ_VALUE.TASK_ROUTING_KEY,
      Buffer.from(JSON.stringify(msg)),
    );
  }
}
