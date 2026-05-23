import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsumerModule } from './consumer/consumer.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Consumer');
  const configApp = await NestFactory.create(ConsumerModule);
  const configService = configApp.get(ConfigService);
  
  const rmqUrl = configService.get<string>('RABBITMQ_URL');
  const rmqQueue = configService.get<string>('RABBITMQ_QUEUE');

  if (!rmqUrl || !rmqQueue) {
    logger.error('Missing RabbitMQ configuration');
    process.exit(1);
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ConsumerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: rmqQueue,
        noAck: false,
        persistent: true,
        prefetchCount: 1,
      },
    }
  );

  await app.listen();
  logger.log(`Consumer listening to queue: ${rmqQueue}`);
  
  await configApp.close();
}

bootstrap();
