import { Module } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service.js';
import { LeaveRequestController } from './leave-request.controller.js';

@Module({
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService],
})
export class LeaveRequestModule {}
