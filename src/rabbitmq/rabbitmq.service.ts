import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendMessage(pattern: string, data: any): Promise<any> {
    return lastValueFrom(this.client.send(pattern, data));
  }

  async emitEvent(pattern: string, data: any): Promise<void> {
    this.client.emit(pattern, data);
  }
}
