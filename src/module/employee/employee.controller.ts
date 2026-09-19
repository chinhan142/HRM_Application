import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import { FilterEmployeeQuery } from './query/filter-employee.query.js';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(Role.HR_MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Create / Onboard a new employee (HR_MANAGER, ADMIN)',
    description:
      'Creates a new employee record with assigned role, department, job title, and optional reporting manager.',
  })
  @ApiCreatedResponse({ description: 'Employee created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid input' })
  @ApiConflictResponse({
    description: 'Employee with this email already exists',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({
    description: 'Forbidden: Requires HR_MANAGER or ADMIN role',
  })
  addEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.addEmployee(dto);
  }

  @Get()
  @Roles(Role.HR_MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get paginated employee list with search and filters (HR_MANAGER, ADMIN)',
    description:
      'Retrieves employees with pagination (page, limit) and optional filters (departmentId, search by name/email/department). Excludes password hashes.',
  })
  @ApiOkResponse({ description: 'Employee list retrieved successfully with pagination info' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires HR_MANAGER or ADMIN role' })
  getEmployeeList(@Query() query: FilterEmployeeQuery) {
    return this.employeeService.getEmployeeList(query);
  }
}
