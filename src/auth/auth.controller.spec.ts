import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it('calls register service method', async () => {
    const dto = { name: 'John', email: 'john@test.dev', password: 'Passw0rd!' };
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'u1',
        name: 'John',
        email: 'john@test.dev',
        roles: [Role.User],
      },
    };
    authService.register.mockResolvedValue(response);

    await expect(controller.register(dto)).resolves.toEqual(response);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('calls login service method', async () => {
    const dto = { email: 'john@test.dev', password: 'Passw0rd!' };
    authService.login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
    });

    await expect(controller.login(dto)).resolves.toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('calls refresh service method', async () => {
    const dto = { refreshToken: 'token' };
    authService.refresh.mockResolvedValue({
      accessToken: 'a2',
      refreshToken: 'r2',
    });

    await expect(controller.refresh(dto)).resolves.toEqual({
      accessToken: 'a2',
      refreshToken: 'r2',
    });
    expect(authService.refresh).toHaveBeenCalledWith(dto);
  });

  it('calls logout with current user id', async () => {
    authService.logout.mockResolvedValue({
      message: 'Logged out successfully',
    });

    await expect(
      controller.logout({
        sub: 'u1',
        email: 'john@test.dev',
        roles: [Role.User],
      }),
    ).resolves.toEqual({ message: 'Logged out successfully' });
    expect(authService.logout).toHaveBeenCalledWith('u1');
  });
});
