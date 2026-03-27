import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get currently authenticated user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  async getMyProfile(@CurrentUser() user: JwtPayload): Promise<UserProfileDto> {
    const profile = await this.usersService.findById(user.sub);
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      roles: profile.roles,
    };
  }
}
