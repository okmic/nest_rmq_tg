import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProducerService } from './producer/producer.service';
import { ProducerController } from './producer/producer.controller';
import { ConsumerService } from './consumer/consumer.service';
import { ConsumerController } from './consumer/consumer.controller';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_PRODUCER',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rmqUrl = configService.get<string>('RABBITMQ_URL');
          const rmqQueue = configService.get<string>('RABBITMQ_QUEUE');
          
          if (!rmqUrl || !rmqQueue) {
            throw new Error('RabbitMQ configuration is missing');
          }
          
          
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rmqUrl], 
              queue: rmqQueue,
              persistent: true,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    forwardRef(() => TelegramModule),
  ],
  controllers: [ProducerController, ConsumerController],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})

export class RabbitMQModule {}