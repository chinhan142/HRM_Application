import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { CurrentUser } from '../auth/decorators/user.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  @ApiOperation({ summary: 'Get current logged-in employee profile' })
  @ApiOkResponse({ description: 'Profile retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or missing token' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  getProfile(@CurrentUser('userId') userId: number) {
    return this.userService.getProfile(userId);
  }
}
