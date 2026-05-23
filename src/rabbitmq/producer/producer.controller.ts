import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProducerService } from './producer.service';
import { SendMessageRequestDto, MessageResponseDto } from './producer.dto';

@ApiTags('producer')
@Controller('api/producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Отправить сообщение в RabbitMQ',
    description: 'Отправляет сообщение в очередь RabbitMQ для дальнейшей обработки'
  })
  @ApiBody({ 
    type: SendMessageRequestDto,
    examples: {
      'telegram-notification': {
        summary: 'Отправка Telegram уведомления',
        value: {
          pattern: 'telegram.notification',
          data: {
            chatId: "12345678",
            text: "System update",
            parseMode: "HTML",
            disableNotification: false
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Сообщение успешно отправлено',
    type: MessageResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Неверный формат запроса'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Ошибка сервера'
  })
  async sendMessage(
    @Body() body: SendMessageRequestDto,
  ): Promise<MessageResponseDto> {
    return this.producerService.sendMessage(body.pattern, body.data);
  }
}