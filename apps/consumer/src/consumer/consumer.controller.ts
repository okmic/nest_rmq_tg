import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);
  constructor(private service: ConsumerService) {
  }

@MessagePattern('telegram.notification')
async handleTelegramNotification(@Payload() message: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();
  
  this.logger.log(`Received message ${message.id}`);
  
  setImmediate(() => {
    this.service.processTelegramNotification(message)
    .catch(error => {
      this.logger.error(`Background processing failed: ${error.message}`);
    })
    .then(r => {
        channel.ack(originalMsg);
    })
  });
  
  return {
    received: true,
    messageId: message.id,
    status: 'queued',
    timestamp: new Date().toISOString()
  };
}

  @MessagePattern('*')
  handleAny(@Payload() message: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    this.logger.warn(`Unknown pattern: ${message.pattern}`);
    
    channel.ack(originalMsg);
    return { received: true, pattern: message.pattern };
  }
  
}
