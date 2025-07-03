import { RabbitMQService } from './rabbitmq.service';
import * as amqp from 'amqplib';
import { injectable, inject } from 'tsyringe';

@injectable()
export class TaskConsumerService {
  constructor(@inject(RabbitMQService) private rabbitMQService: RabbitMQService) {}

  async consumeTaskActions() {
    const channel = await this.rabbitMQService.connect();
    if (!channel) throw new Error('RabbitMQ channel is not available');
    await channel.consume('task.actions', (msg: amqp.ConsumeMessage | null) => {
      if (msg) {
        const content = msg.content.toString();
        const data = JSON.parse(content);
        console.log(`Task ${data.taskId} was ${data.action} at ${data.timestamp}`);
        channel.ack(msg);
      }
    });
  }
}
