import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of users when findAll is called', async () => {
    const users = [{ id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' }];
    mockUsersService.findAll.mockResolvedValue(users);

    expect(await controller.findAll()).toEqual(users);
  });

  it('should return a user when findOne is called with a valid id', async () => {
    const user = { id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' };
    mockUsersService.findOne.mockResolvedValue(user);

    expect(await controller.findOne('1')).toEqual(user);
  });

  it('should throw NotFoundException when findOne is called with an invalid id', async () => {
    mockUsersService.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('should create a new user when create is called with valid data', async () => {
    const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com', password: '123456' };
    const newUser = { id: 1, ...createUserDto };
    mockUsersService.create.mockResolvedValue(newUser);

    expect(await controller.create(createUserDto)).toEqual(newUser);
  });

  it('should update a user when update is called with valid data', async () => {
    const updateUserDto: UpdateUserDto = { name: 'Jane Doe', email: 'jane@example.com' };
    const updatedUser = { id: 1, ...updateUserDto };
    mockUsersService.update.mockResolvedValue(updatedUser);

    expect(await controller.update('1', updateUserDto)).toEqual(updatedUser);
  });

  it('should delete a user when remove is called with a valid id', async () => {
    const response = { message: 'Usuario eliminado exitosamente' };
    mockUsersService.remove.mockResolvedValue(response);

    expect(await controller.remove('1')).toEqual(response);
  });
});
