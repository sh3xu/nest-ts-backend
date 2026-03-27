import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(userId);
  }

  createUser(
    name: string,
    email: string,
    password: string,
    roles: Role[] = [Role.User],
  ): Promise<UserDocument> {
    return this.usersRepository.createUser(name, email, password, roles);
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.usersRepository.updateRefreshTokenHash(userId, refreshTokenHash);
  }
}
