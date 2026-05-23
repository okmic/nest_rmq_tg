import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-token'),
};

jest.mock('grammy', () => ({
  Bot: jest.fn().mockImplementation(() => ({
    api: { sendMessage: jest.fn().mockResolvedValue(true) },
  })),
}));

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send message', async () => {
    const result = await service.sendNotification({
      chatId: 123,
      message: 'Hello',
    });
    expect(result).toBe(true);
  });
});