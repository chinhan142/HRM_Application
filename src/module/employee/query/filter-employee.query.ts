import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FilterEmployeeQuery {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination (default: 1)',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page (default: 4)',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    example: 'John',
    description: 'Search keyword for first name, last name, email or department name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by Department ID',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  departmentId?: number;
}
