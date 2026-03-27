import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { MongoIdPipe } from '../common/pipes/mongo-id.pipe';
import { UsersService } from '../users/users.service';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Admin-only sample endpoint' })
  @ApiOkResponse({ type: AdminStatsDto })
  getAdminStats(): AdminStatsDto {
    return {
      status: 'ok',
      message: 'Admin-only endpoint is working',
    };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Find user by id (admin only)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of user' })
  @ApiOkResponse({ type: UserProfileDto })
  async findUserById(
    @Param('id', MongoIdPipe) id: string,
  ): Promise<UserProfileDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };
  }
}
