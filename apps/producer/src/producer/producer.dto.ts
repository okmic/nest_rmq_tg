import { ApiProperty } from '@nestjs/swagger';

export class TelegramNotificationDataDto {
  @ApiProperty({ 
    example: '12345678', 
    description: 'Telegram chat ID'
  })
  chatId!: string;

  @ApiProperty({ 
    example: 'System update', 
    description: 'Текст сообщения'
  })
  text!: string;

  @ApiProperty({ 
    example: 'HTML', 
    description: 'Формат сообщения (HTML или Markdown)',
    required: false,
    enum: ['HTML', 'Markdown']
  })
  parseMode?: 'HTML' | 'Markdown';

  @ApiProperty({ 
    example: false, 
    description: 'Отправлять без звука',
    required: false,
    default: false
  })
  disableNotification?: boolean;
}

export class SendMessageRequestDto {
  @ApiProperty({ 
    example: 'telegram.notification', 
    description: 'Шаблон маршрутизации сообщения'
  })
  pattern!: string;

  @ApiProperty({ 
    description: 'Данные сообщения',
    type: TelegramNotificationDataDto
  })
  data!: TelegramNotificationDataDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'a3f4e5d6-1234-5678-9abc-def012345678' })
  id!: string;

  @ApiProperty({ example: 'telegram.notification' })
  pattern!: string;

  @ApiProperty({ type: TelegramNotificationDataDto })
  data!: TelegramNotificationDataDto;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'tg_rmq_nest_producer', required: false })
  source?: string;

  @ApiProperty({ example: '1.0.0', required: false })
  version?: string;

  @ApiProperty({ 
    example: { retryCount: 0, correlationId: 'test-123' },
    required: false 
  })
  metadata?: {
    retryCount?: number;
    originalId?: string;
    correlationId?: string;
  };
}
