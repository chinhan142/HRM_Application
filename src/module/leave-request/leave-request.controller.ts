import { Controller } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service.js';

@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}
}
