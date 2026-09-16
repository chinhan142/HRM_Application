import { Controller } from '@nestjs/common';
import { PayrollService } from './payroll.service.js';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}
}
