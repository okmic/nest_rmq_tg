import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';

export interface SendNotificationDto {
  chatId: number;
  message: string;
  parseMode?: 'HTML' | 'Markdown';
  disableNotification?: boolean;
}

@Injectable()
export class TelegramService {
  private bot: Bot;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    
    if (!token) {
      this.logger.error('TELEGRAM_BOT_TOKEN не найден в .env');
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    
    this.bot = new Bot(token);
    this.logger.log('Telegram bot initialized for sending notifications');
  }

  async sendNotification(data: SendNotificationDto): Promise<boolean> {
    try {
      await this.bot.api.sendMessage(data.chatId, data.message, {
        parse_mode: data.parseMode || 'HTML',
        disable_notification: data.disableNotification || false,
      });
      
      this.logger.log(`✅ Notification sent to chat ${data.chatId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send notification: ${error}`);
      return false;
    }
  }

  async sendBulkNotifications(
    notifications: SendNotificationDto[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.sendNotification(notification);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}
