import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Sarah', description: 'First name of employee' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Connor', description: 'Last name of employee' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'sarah.connor@company.com',
    description: 'Corporate email address',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'SecurePass123!',
    description: 'Initial password (default is Emp123@ if not provided)',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Assigned employee role (USER, MANAGER, HR_MANAGER, ADMIN)',
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 1, description: 'Department ID' })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty({ example: 1, description: 'Job Title ID' })
  @IsNumber()
  @IsNotEmpty()
  jobTitleId: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Direct Reporting Manager Employee ID (optional)',
  })
  @IsNumber()
  @IsOptional()
  managerId?: number;
}
