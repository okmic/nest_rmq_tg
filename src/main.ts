import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const rmqUrl = configService.get<string>('RABBITMQ_URL');
  const rmqQueue = configService.get<string>('RABBITMQ_QUEUE');

  if (!rmqUrl || !rmqQueue) {
    logger.error('Missing required RabbitMQ configuration');
    process.exit(1);
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: rmqQueue,
      noAck: false,
      persistent: true,
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
  logger.log('RabbitMQ Consumer microservice started');

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);
}

bootstrap();