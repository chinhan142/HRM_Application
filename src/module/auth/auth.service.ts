import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (employee) {
      throw new ConflictException('This employee is already exist!');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const newEmployee = await this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashPassword,
        departmentId: dto.departmentId,
        jobTitleId: dto.jobTitleId,
      },
    });

    const { password, ...result } = newEmployee;
    return result;
  }

  async login(user: any): Promise<{ access_token: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.employee.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
