import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import bcrypt from 'bcrypt';
import { FilterEmployeeQuery } from './query/filter-employee.query.js';
import { EmployeeStatus, Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async addEmployee(dto: CreateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (employee) {
      throw new ConflictException('This employee is already exist!');
    }

    const rawPassword = dto.password || 'Emp123@';
    const hashPassword = await bcrypt.hash(rawPassword, 10);

    const newEmployee = await this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashPassword,
        role: dto.role,
        departmentId: dto.departmentId,
        jobTitleId: dto.jobTitleId,
        managerId: dto.managerId,
      },
    });

    const { password, ...result } = newEmployee;
    return result;
  }

  async getEmployeeList(query: FilterEmployeeQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 4;
    const skip = (page - 1) * limit;

    // Using where input in prisma to filter nested conditions
    const where: Prisma.EmployeeWhereInput = {};
    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.search) {
      const keyword = query.search.trim();

      where.OR = [
        { firstName: { contains: keyword, mode: 'insensitive' } },
        { lastName: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        { department: { name: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          jobTitle: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.employee.count({ where }),
    ]);

    const sanitizedData = data.map(({ password: _, ...emp }) => emp);

    return {
      data: sanitizedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteEmployee(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('This employee does not exist!');
    }

    const deleteEmployee = await this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        status: EmployeeStatus.TERMINATED,
      },
    });

    const { password, ...result } = deleteEmployee;
    return result;
  }

  async updateEmployee(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('This employee does not exist!');
    }

    const updateEmployee = await this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        role: dto.role,
        departmentId: dto.departmentId,
        jobTitleId: dto.jobTitleId,
        managerId: dto.managerId,
      },
    });

    const { password, ...result } = updateEmployee;

    return result;
  }
}
