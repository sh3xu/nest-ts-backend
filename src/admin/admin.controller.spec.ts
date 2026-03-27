import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  let controller: AdminController;
  let usersService: {
    findById: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get(AdminController);
  });

  it('returns admin stats', () => {
    expect(controller.getAdminStats()).toEqual({
      status: 'ok',
      message: 'Admin-only endpoint is working',
    });
  });

  it('returns user profile for valid user id', async () => {
    usersService.findById.mockResolvedValue({
      id: 'u1',
      name: 'Admin User',
      email: 'admin@test.dev',
      roles: [Role.Admin],
    });

    await expect(controller.findUserById('u1')).resolves.toEqual({
      id: 'u1',
      name: 'Admin User',
      email: 'admin@test.dev',
      roles: [Role.Admin],
    });
  });

  it('throws NotFoundException when user does not exist', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(controller.findUserById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
