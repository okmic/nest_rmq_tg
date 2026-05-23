import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);
  
  private retryStore = new Map<string, {
    message: any;
    retryCount: number;
    nextRetryAt: number;
  }>();

  constructor(private telegramService: TelegramService) {
    setInterval(() => this.processRetries(), 3000);
  }

  async processTelegramNotification(message: any): Promise<void> {
    const data = message.data;
    this.logger.log(`Processing message ${message.id} for chat ${data.chatId}`);
    
    try {
      const result = await this.telegramService.sendNotification({
        chatId: data.chatId,
        message: data.text,
        parseMode: data.parseMode || 'HTML',
        disableNotification: data.disableNotification || false,
      })

      this.logger.log(`✅ Message ${message.id} sent to Telegram (msg_id: ${result})`);
      
      
    } catch (error) {
      this.logger.error(`Failed to send message ${message.id}: ${error}`);
      await this.handleRetry(message, error);
    }
  }

  private async handleRetry(message: any, error: any): Promise<void> {
    const retryCount = message.metadata?.retryCount || 0;
    const maxRetries = 3;
    
    if (retryCount < maxRetries) {
      const delays = [5000, 10000, 20000];
      const nextRetryDelay = delays[retryCount];
      const nextRetryAt = Date.now() + nextRetryDelay;
      
      message.metadata = {
        ...message.metadata,
        retryCount: retryCount + 1,
        lastError: error.message,
        lastRetryAt: new Date().toISOString(),
        nextRetryAt: new Date(nextRetryAt).toISOString()
      };
      
      this.retryStore.set(message.id, {
        message,
        retryCount: retryCount + 1,
        nextRetryAt
      });
      
      this.logger.warn(
        `⚠️ Message ${message.id} will retry ${retryCount + 1}/${maxRetries} in ${nextRetryDelay/1000}s`
      );
      
    } else {
      this.logger.error(`❌ Message ${message.id} failed after ${maxRetries} retries`);
      await this.saveToDeadLetterQueue(message, error);
    }
  }

  private async processRetries(): Promise<void> {
    const now = Date.now();
    
    for (const [id, retryData] of this.retryStore.entries()) {
      if (now >= retryData.nextRetryAt) {
        this.retryStore.delete(id);
        
        this.logger.log(`🔄 Retrying message ${id} (attempt ${retryData.retryCount})`);
        
        await this.processTelegramNotification(retryData.message);
      }
    }
  }

  private async saveToDeadLetterQueue(message: any, error: any): Promise<void> {
    const deadLetter = {
      id: message.id,
      originalMessage: message,
      error: error.message,
      failedAt: new Date().toISOString(),
      retryCount: message.metadata?.retryCount
    };
    
    this.logger.log(`💀 Message ${message.id} saved to dead letter queue`, deadLetter);
  }
}