import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service.js';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto.js';
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
    summary:
      'Get paginated employee list with search and filters (HR_MANAGER, ADMIN)',
    description:
      'Retrieves employees with pagination (page, limit) and optional filters (departmentId, search by name/email/department). Excludes password hashes.',
  })
  @ApiOkResponse({
    description: 'Employee list retrieved successfully with pagination info',
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({
    description: 'Forbidden: Requires HR_MANAGER or ADMIN role',
  })
  getEmployeeList(@Query() query: FilterEmployeeQuery) {
    return this.employeeService.getEmployeeList(query);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({
    summary: 'Soft-delete an employee (HR_MANAGER, ADMIN)',
    description:
      'Sets employee status to TERMINATED without physical database deletion to preserve relational integrity.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID' })
  @ApiOkResponse({ description: 'Employee status changed to TERMINATED successfully' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires HR_MANAGER or ADMIN role' })
  deleteEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.deleteEmployee(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({
    summary: 'Update employee information (HR_MANAGER, ADMIN)',
    description: 'Partially updates employee fields (names, email, role, department, jobTitle, manager).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID' })
  @ApiOkResponse({ description: 'Employee updated successfully' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires HR_MANAGER or ADMIN role' })
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(id, dto);
  }
}
