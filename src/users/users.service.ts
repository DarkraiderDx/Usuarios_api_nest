  import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { User } from './entities/user.entity';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';

  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
    ) {}

    findAll() {
      return this.usersRepository.find();
    }

    async findOne(id: number) {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    }

    async create(createUserDto: CreateUserDto) {
      const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        throw new BadRequestException('El correo electronico ya existe');
      }

      const newUser = this.usersRepository.create(createUserDto);
      return this.usersRepository.save(newUser);
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
      const user = await this.usersRepository.preload({
        id: id,
        ...updateUserDto,
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      
      return this.usersRepository.save(user);
    }

    async remove(id: number) {
      const user = await this.findOne(id);
      await this.usersRepository.remove(user);
      return { message: 'Usuario eliminado exitosamente' };
    }
  }
