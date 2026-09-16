import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller.js';
import { PayrollService } from './payroll.service.js';

describe('PayrollController', () => {
  let controller: PayrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [PayrollService],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
