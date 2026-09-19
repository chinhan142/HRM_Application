import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, Employee } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id: userId,
      },
      include: {
        department: {
          select: {
            name: true,
            location: true,
          },
        },
        jobTitle: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('This employee does not exist!');
    }

    const { password: _, ...result } = employee;
    return result;
  }
}
