import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';

@Controller()
export class UsersMessageController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.findById')
  async findById(@Payload() userId: string): Promise<UserProfileDto | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };
  }
}
