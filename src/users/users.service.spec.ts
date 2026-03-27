import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../common/enums/role.enum';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    createUser: jest.Mock;
    updateRefreshTokenHash: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('delegates findByEmail to repository', async () => {
    const user = { id: 'u1', email: 'user@test.dev' };
    repository.findByEmail.mockResolvedValue(user);

    await expect(service.findByEmail('user@test.dev')).resolves.toEqual(user);
    expect(repository.findByEmail).toHaveBeenCalledWith('user@test.dev');
  });

  it('delegates createUser with default role', async () => {
    const createdUser = { id: 'u2' };
    repository.createUser.mockResolvedValue(createdUser);

    await expect(
      service.createUser('John', 'john@test.dev', 'hashed-password'),
    ).resolves.toEqual(createdUser);
    expect(repository.createUser).toHaveBeenCalledWith(
      'John',
      'john@test.dev',
      'hashed-password',
      [Role.User],
    );
  });

  it('delegates updateRefreshTokenHash', async () => {
    repository.updateRefreshTokenHash.mockResolvedValue(undefined);

    await expect(
      service.updateRefreshTokenHash('u1', 'refresh-hash'),
    ).resolves.toBeUndefined();
    expect(repository.updateRefreshTokenHash).toHaveBeenCalledWith(
      'u1',
      'refresh-hash',
    );
  });
});
