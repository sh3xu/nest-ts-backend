import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  createUser(
    name: string,
    email: string,
    password: string,
    roles: Role[] = [Role.User],
  ): Promise<UserDocument> {
    return this.userModel.create({
      name,
      email: email.toLowerCase(),
      password,
      roles,
    });
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash }).exec();
  }
}
