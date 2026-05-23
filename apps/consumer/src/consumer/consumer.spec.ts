import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { RmqContext } from '@nestjs/microservices';

const mockConsumerService = {
  processTelegramNotification: jest.fn().mockResolvedValue(undefined),
};

describe('ConsumerController', () => {
  let controller: ConsumerController;
  let mockChannel: any;
  let mockContext: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    mockChannel = {
      ack: jest.fn(),
    };

    mockContext = {
      getChannelRef: jest.fn().mockReturnValue(mockChannel),
      getMessage: jest.fn().mockReturnValue({ fields: { deliveryTag: '123' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumerController],
      providers: [
        {
          provide: ConsumerService,
          useValue: mockConsumerService,
        },
      ],
    }).compile();

    controller = module.get<ConsumerController>(ConsumerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleTelegramNotification', () => {
    const testMessage = {
      id: '123',
      data: { chatId: 123456, text: 'Hello' },
    };

    it('should return queued status immediately', async () => {
      const result = await controller.handleTelegramNotification(
        testMessage,
        mockContext,
      );

      expect(result.received).toBe(true);
      expect(result.messageId).toBe('123');
      expect(result.status).toBe('queued');
    });

    it('should call service to process message', async () => {
      controller.handleTelegramNotification(testMessage, mockContext);
      
      // Ждем setImmediate
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockConsumerService.processTelegramNotification).toHaveBeenCalledWith(testMessage);
    }, 10000); // Увеличиваем таймаут

    it('should acknowledge message after processing', async () => {
      controller.handleTelegramNotification(testMessage, mockContext);
      
      // Ждем setImmediate и обработку
      await new Promise(resolve => setTimeout(resolve, 10));
      await new Promise(resolve => setImmediate(resolve));
      
      expect(mockChannel.ack).toHaveBeenCalled();
    }, 10000);
  });

  describe('handleAny', () => {
    it('should handle unknown patterns', () => {
      const unknownMessage = { pattern: 'unknown.pattern', data: {} };
      
      const result = controller.handleAny(unknownMessage, mockContext);

      expect(result.received).toBe(true);
      expect(result.pattern).toBe('unknown.pattern');
      expect(mockChannel.ack).toHaveBeenCalled();
    });
  });
});