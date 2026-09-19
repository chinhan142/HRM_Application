import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import bcrypt from 'bcrypt';

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
}
