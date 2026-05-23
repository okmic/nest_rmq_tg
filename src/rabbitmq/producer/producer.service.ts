import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, retry, catchError, throwError, timer } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { IdempotencyUtil } from '../utils/idempotency.util';
import { DEFAULT_RETRY_CONFIG } from '../interfaces/retry.config.interface';

@Injectable()
export class ProducerService implements OnModuleInit {
  private readonly logger = new Logger(ProducerService.name);
  
  constructor(
    @Inject('RABBITMQ_PRODUCER') private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('RabbitMQ Producer connected successfully');
  }

  async sendMessage<T>(
    pattern: string,
    data: T,
    options?: {
      retryCount?: number;
      correlationId?: string;
    },
  ): Promise<Message<T>> {
    const message: Message<T> = {
      id: IdempotencyUtil.generateId(),
      pattern,
      data,
      timestamp: new Date().toISOString(),
      source: 'tg_rmq_nest_producer',
      version: '1.0.0',
      metadata: {
        retryCount: options?.retryCount || 0,
        correlationId: options?.correlationId,
      },
    };

    this.logger.log(`Sending message ${message.id} with pattern ${pattern}`);

    try {
      const result = await lastValueFrom(
        this.client.send(pattern, message).pipe(
          timeout(30000),
          retry({
            count: DEFAULT_RETRY_CONFIG.maxRetries,
            delay: (error, retryCount) => {
              const delayTime = DEFAULT_RETRY_CONFIG.retryDelay * 
                                Math.pow(DEFAULT_RETRY_CONFIG.backoffMultiplier, retryCount - 1);
              
              this.logger.warn(
                `Retry ${retryCount} for message ${message.id} due to: ${error?.message || error}`,
                `Waiting ${delayTime}ms before retry`
              );
              
              return timer(delayTime);
            },
          }),
          catchError((error) => {
            this.logger.error(
              `Failed to send message ${message.id} after all retries: ${error?.message || error}`,
            );
            return throwError(() => error);
          }),
        ),
      );

      this.logger.log(`Message ${message.id} sent successfully to RabbitMQ`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send message ${message.id}: ${errorMessage}`);
      throw new Error(`Producer error: ${errorMessage}`);
    }
  }

  async emitEvent<T>(pattern: string, data: T): Promise<void> {
    const message: Message<T> = {
      id: IdempotencyUtil.generateId(),

      pattern,
      data,
      timestamp: new Date().toISOString(),
      source: 'tg_rmq_nest_producer',
      version: '1.0.0',
    };

    this.logger.log(`Emitting event ${message.id} with pattern ${pattern}`);
    
    try {
      this.client.emit(pattern, message);
      this.logger.log(`Event ${message.id} emitted successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to emit event ${message.id}: ${errorMessage}`);
      throw error;
    }
  }
}

