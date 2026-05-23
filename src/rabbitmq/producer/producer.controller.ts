import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { Message } from '../interfaces/message.interface';

@Controller('api/producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() body: { pattern: string; data: any },
  ): Promise<Message> {
    return this.producerService.sendMessage(body.pattern, body.data);
  }

}