import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LeaveRequestService } from './leave-request.service.js';
import { LeaveRequestDto } from './dto/leave-request.dto.js';
import { CurrentUser } from '../auth/decorators/user.decorator.js';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Leave Requests')
@ApiBearerAuth()
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a new leave request (All logged-in employees)',
    description:
      'Creates a new leave request in PENDING status. Validates endDate >= startDate.',
  })
  @ApiCreatedResponse({ description: 'Leave request submitted successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or endDate < startDate' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  createLeaveRequest(
    @CurrentUser('userId') userId: number,
    @Body() dto: LeaveRequestDto,
  ) {
    return this.leaveRequestService.createLeaveRequest(userId, dto);
  }

  @Patch(':id/approve-manager')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Level 1: Direct Manager approves leave request (MANAGER only)',
    description:
      'Allows direct reporting manager (managerId === req.user.id) to approve leave request, changing status to APPROVED_BY_MANAGER.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Leave Request ID' })
  @ApiOkResponse({ description: 'Leave request approved by direct manager' })
  @ApiBadRequestResponse({ description: 'Leave request is already processed' })
  @ApiForbiddenResponse({
    description: 'Forbidden: You are not the direct manager of this employee',
  })
  @ApiNotFoundResponse({ description: 'Leave request not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  approveLeaveRequestManager(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leaveRequestService.approveLeaveRequestManager(userId, id);
  }

  @Patch(':id/approve-hr')
  @Roles(Role.HR_MANAGER)
  @ApiOperation({
    summary: 'Level 2: HR Manager final approval (HR_MANAGER only)',
    description:
      'Final approval stage for HR Manager. Requires status to already be APPROVED_BY_MANAGER. Changes status to APPROVED_BY_HR.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Leave Request ID' })
  @ApiOkResponse({ description: 'Leave request officially approved by HR' })
  @ApiBadRequestResponse({
    description: 'Leave request must be approved by Manager first',
  })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires HR_MANAGER role' })
  @ApiNotFoundResponse({ description: 'Leave request not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  approveLeaveRequestHRManager(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leaveRequestService.approveLeaveRequestHRManager(userId, id);
  }
}
