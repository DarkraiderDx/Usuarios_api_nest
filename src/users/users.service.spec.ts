import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of users when findAll is called', async () => {
    const users = [{ id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' }];
    mockUserRepository.find.mockResolvedValue(users);

    expect(await service.findAll()).toEqual(users);
  });

  it('should return a user when findOne is called with a valid id', async () => {
    const user = { id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' };
    mockUserRepository.findOne.mockResolvedValue(user);

    expect(await service.findOne(1)).toEqual(user);
  });

  it('should throw NotFoundException when findOne is called with an invalid id', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should create a new user when create is called with valid data', async () => {
    const createUserDto = { name: 'John Doe', email: 'john@example.com', password: '123456' };
    const newUser = { id: 1, ...createUserDto };
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockReturnValue(newUser);
    mockUserRepository.save.mockResolvedValue(newUser);

    expect(await service.create(createUserDto)).toEqual(newUser);
  });

  it('should throw BadRequestException when create is called with an existing email', async () => {
    const createUserDto = { name: 'John Doe', email: 'john@example.com', password: '123456' };
    mockUserRepository.findOne.mockResolvedValue(createUserDto);

    await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
  });

  it('should update a user when update is called with valid data', async () => {
    const updateUserDto = { name: 'Jane Doe', email: 'jane@example.com' };
    const existingUser = { id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' };
    const updatedUser = { ...existingUser, ...updateUserDto };

    mockUserRepository.preload.mockResolvedValue(updatedUser);
    mockUserRepository.save.mockResolvedValue(updatedUser);

    expect(await service.update(1, updateUserDto)).toEqual(updatedUser);
  });

  it('should throw NotFoundException when update is called with an invalid id', async () => {
    mockUserRepository.preload.mockResolvedValue(null);

    await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
  });

  it('should delete a user when remove is called with a valid id', async () => {
    const user = { id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' };
    mockUserRepository.findOne.mockResolvedValue(user);
    mockUserRepository.remove.mockResolvedValue(user);

    expect(await service.remove(1)).toEqual({ message: 'Usuario eliminado exitosamente' });
  });

  it('should throw NotFoundException when remove is called with an invalid id', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
