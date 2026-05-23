import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';

const mockProducerService = {
  sendMessage: jest.fn(),
};

describe('ProducerController', () => {
  let controller: ProducerController;
  let service: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [
        {
          provide: ProducerService,
          useValue: mockProducerService,
        },
      ],
    }).compile();

    controller = module.get<ProducerController>(ProducerController);
    service = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send message via POST /api/producer/send', async () => {
    const body = { pattern: 'test.pattern', data: { chatId: "123", text: "test msgw" } };
    const expectedResponse = { success: true, id: '123' };
    mockProducerService.sendMessage.mockResolvedValue(expectedResponse);

    const result = await controller.sendMessage(body);

    expect(service.sendMessage).toHaveBeenCalledWith(body.pattern, body.data);
    expect(result).toEqual(expectedResponse);
  });
});