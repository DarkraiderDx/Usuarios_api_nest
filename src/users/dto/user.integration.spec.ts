import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Integración de UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'DarkraiderDx99',
          database: 'usuarios_test_db',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    const connection = repository.manager.connection;
    if (connection.isInitialized) {
      await connection.destroy();
    }
  });

  afterEach(async () => {
    await repository.query('DELETE FROM user;');
  });

  it('Debería crear un nuevo usuario en la base de datos', async () => {
    const nuevoUsuario = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'password123',
    };

    const usuarioCreado = await service.create(nuevoUsuario);
    expect(usuarioCreado).toHaveProperty('id');
    expect(usuarioCreado.name).toEqual(nuevoUsuario.name);
    expect(usuarioCreado.email).toEqual(nuevoUsuario.email);

    const usuarioEnDb = await repository.findOneBy({ id: usuarioCreado.id });
    expect(usuarioEnDb).toBeDefined();
    expect(usuarioEnDb.name).toEqual(nuevoUsuario.name);
    expect(usuarioEnDb.email).toEqual(nuevoUsuario.email);
  });

  it('Debería lanzar BadRequestException si el email ya existe', async () => {
    const nuevoUsuario = {
      name: 'María Gómez',
      email: 'maria.gomez@example.com',
      password: 'password123',
    };

    await service.create(nuevoUsuario);

    try {
      await service.create(nuevoUsuario);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('El correo electronico ya existe');
    }
  });

  it('Debería encontrar todos los usuarios en la base de datos', async () => {
    await repository.save([
      { name: 'Usuario 1', email: 'usuario1@example.com', password: 'password1' },
      { name: 'Usuario 2', email: 'usuario2@example.com', password: 'password2' },
    ]);

    const usuarios = await service.findAll();
    expect(usuarios.length).toBe(2);
    expect(usuarios[0].name).toBe('Usuario 1');
    expect(usuarios[1].name).toBe('Usuario 2');
  });

  it('Debería encontrar un usuario por ID', async () => {
    const nuevoUsuario = await repository.save({
      name: 'Usuario Específico',
      email: 'usuario.especifico@example.com',
      password: 'password123',
    });

    const usuarioEncontrado = await service.findOne(nuevoUsuario.id);
    expect(usuarioEncontrado).toBeDefined();
    expect(usuarioEncontrado.name).toEqual('Usuario Específico');
    expect(usuarioEncontrado.email).toEqual('usuario.especifico@example.com');
  });

  it('Debería lanzar NotFoundException si el usuario no es encontrado por ID', async () => {
    const idInexistente = 999;
    try {
      await service.findOne(idInexistente);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Usuario no encontrado');
    }
  });

  it('Debería actualizar un usuario existente', async () => {
    const nuevoUsuario = await repository.save({
      name: 'Usuario Antes de Actualizar',
      email: 'actualizar.usuario@example.com',
      password: 'password123',
    });

    const usuarioActualizado = await service.update(nuevoUsuario.id, {
      name: 'Usuario Actualizado',
      email: 'usuario.actualizado@example.com',
    });

    expect(usuarioActualizado).toBeDefined();
    expect(usuarioActualizado.name).toEqual('Usuario Actualizado');
    expect(usuarioActualizado.email).toEqual('usuario.actualizado@example.com');

    const usuarioEnDb = await repository.findOneBy({ id: nuevoUsuario.id });
    expect(usuarioEnDb).toBeDefined();
    expect(usuarioEnDb.name).toEqual(usuarioActualizado.name);
    expect(usuarioEnDb.email).toEqual(usuarioActualizado.email);
  });

  it('Debería lanzar NotFoundException si el usuario a actualizar no existe', async () => {
    const idInexistente = 999;
    try {
      await service.update(idInexistente, { name: 'Nuevo Nombre' });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Usuario no encontrado');
    }
  });

  it('Debería eliminar un usuario existente', async () => {
    const nuevoUsuario = await repository.save({
      name: 'Usuario para Eliminar',
      email: 'eliminar.usuario@example.com',
      password: 'password123',
    });

    await service.remove(nuevoUsuario.id);

    const usuarioEliminado = await repository.findOneBy({ id: nuevoUsuario.id });
    expect(usuarioEliminado).toBeNull();
  });

  it('Debería lanzar NotFoundException si el usuario a eliminar no existe', async () => {
    const idInexistente = 999;
    try {
      await service.remove(idInexistente);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Usuario no encontrado');
    }
  });
});
