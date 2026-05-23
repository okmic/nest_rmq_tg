import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer/producer.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Producer');
  const app = await NestFactory.create(ProducerModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Producer API')
    .setDescription('Отправка сообщений в RabbitMQ')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Producer HTTP server on port ${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
