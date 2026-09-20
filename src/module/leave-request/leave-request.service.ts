import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveRequestDto } from './dto/leave-request.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LeaveStatus } from '@prisma/client';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeaveRequest(userId: number, dto: LeaveRequestDto) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id: userId,
      },
    });

    if (!employee) {
      throw new NotFoundException('This employee does not exist!');
    }

    if (dto.endDate < dto.startDate) {
      throw new BadRequestException(
        'End date must be greater than or equal to start date',
      );
    }

    return await this.prisma.leaveRequest.create({
      data: {
        employeeId: userId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        type: dto.type,
        reason: dto.reason,
      },
    });
  }

  async approveLeaveRequestManager(userId: number, id: number) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: {
        id: id,
      },
      include: {
        employee: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('This leave request does not exist!');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is already processed!');
    }

    if (userId !== leaveRequest.employee.managerId) {
      throw new ForbiddenException('You are not the manager of this employee!');
    }

    const updateLeaveRequest = await this.prisma.leaveRequest.update({
      where: {
        id: id,
      },
      data: {
        status: LeaveStatus.APPROVED_BY_MANAGER,
        approvedByManagerId: userId,
      },
    });

    return updateLeaveRequest;
  }

  async approveLeaveRequestHRManager(userId: number, id: number) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: {
        id: id,
      },
      include: {
        employee: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('This leave request does not exist!');
    }

    if (leaveRequest.status !== LeaveStatus.APPROVED_BY_MANAGER) {
      throw new BadRequestException(
        'Leave request must be approved by Manager first!',
      );
    }

    const updateLeaveRequest = await this.prisma.leaveRequest.update({
      where: {
        id: id,
      },
      data: {
        status: LeaveStatus.APPROVED_BY_HR,
        approvedByHrId: userId,
      },
    });

    return updateLeaveRequest;
  }
}
