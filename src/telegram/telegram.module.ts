import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {
}