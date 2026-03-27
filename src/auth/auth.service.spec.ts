import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    createUser: jest.Mock;
    updateRefreshTokenHash: jest.Mock;
    findById: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('registers a new user and returns tokens', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.createUser.mockResolvedValue({
      id: 'u1',
      name: 'John',
      email: 'john@test.dev',
      roles: [Role.User],
    });
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    usersService.updateRefreshTokenHash.mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock)
      .mockResolvedValueOnce('hashed-password')
      .mockResolvedValueOnce('hashed-refresh-token');

    const result = await service.register({
      name: 'John',
      email: 'john@test.dev',
      password: 'Passw0rd!',
    });

    expect(usersService.createUser).toHaveBeenCalledWith(
      'John',
      'john@test.dev',
      'hashed-password',
      [Role.User],
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'u1',
        name: 'John',
        email: 'john@test.dev',
        roles: [Role.User],
      },
    });
  });

  it('throws on duplicate registration email', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'u-existing' });

    await expect(
      service.register({
        name: 'Existing',
        email: 'existing@test.dev',
        password: 'Passw0rd!',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('logs in existing user with valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u2',
      name: 'Jane',
      email: 'jane@test.dev',
      password: 'stored-hash',
      roles: [Role.Admin],
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    usersService.updateRefreshTokenHash.mockResolvedValue(undefined);

    const result = await service.login({
      email: 'jane@test.dev',
      password: 'Passw0rd!',
    });

    expect(result.user.roles).toEqual([Role.Admin]);
    expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
      'u2',
      'hashed-refresh-token',
    );
  });

  it('throws UnauthorizedException for invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@test.dev', password: 'Passw0rd!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes token for valid refresh token', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u3' });
    usersService.findById.mockResolvedValue({
      id: 'u3',
      name: 'Refresh User',
      email: 'refresh@test.dev',
      roles: [Role.User],
      refreshTokenHash: 'stored-hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    jwtService.signAsync
      .mockResolvedValueOnce('new-access')
      .mockResolvedValueOnce('new-refresh');
    usersService.updateRefreshTokenHash.mockResolvedValue(undefined);

    const result = await service.refresh({
      refreshToken: 'valid-refresh-token',
    });
    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
  });

  it('throws ForbiddenException for invalid refresh token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      service.refresh({ refreshToken: 'invalid-refresh-token' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
