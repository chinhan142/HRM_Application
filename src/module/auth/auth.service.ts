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

  register(dto: RegisterDto) {
    throw new Error('Method not implemented.');
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    const employee = await this.prisma.employee.findFirst({
      where: {
        email: email,
      },
    });

    if (!employee) {
      throw new UnauthorizedException('This user does not exist!');
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      throw new UnauthorizedException('This user does not exist!');
    }

    const payload = {
      sub: employee.id,
      email: employee.email,
      role: employee.role,
    };

    return { access_token: await this.jwt.signAsync(payload) };
  }
}
