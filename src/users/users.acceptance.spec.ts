import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module'; // Asegúrate de que esté importado tu UsersModule
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Connection } from 'typeorm';

describe('UsersController - Aceptación', () => {
  let app: INestApplication;
  let service: UsersService;
  let connection: Connection;

  // Configura el módulo de prueba
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
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
      ],
    }).compile();

    app = module.createNestApplication();
    service = module.get<UsersService>(UsersService);
    connection = module.get<Connection>(Connection);

    await app.init();
  });

  // Limpiar la base de datos antes de cada prueba
  afterEach(async () => {
    await connection.getRepository(User).query('DELETE FROM user');
  });

  // Cerrar la conexión después de todas las pruebas
  afterAll(async () => {
    await app.close();
  });

  it('Debería crear un usuario y devolverlo en la respuesta', async () => {
    const createUserDto = { name: 'Test User', email: 'test@example.com', password: '123456' };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto);

    expect(response.status).toBe(201); // Verifica que el estado sea 201 (Creado)
    expect(response.body.email).toEqual(createUserDto.email);
    expect(response.body.name).toEqual(createUserDto.name);
  });

  it('Debería obtener todos los usuarios', async () => {
    const response = await request(app.getHttpServer()).get('/users');

    expect(response.status).toBe(200); // Verifica que el estado sea 200 (OK)
    expect(Array.isArray(response.body)).toBeTruthy(); // Verifica que la respuesta sea un array
  });

  it('Debería obtener un usuario por ID', async () => {
    const user = await service.create({ name: 'Test User', email: 'test@example.com', password: '123456' });

    const response = await request(app.getHttpServer()).get(`/users/${user.id}`);

    expect(response.status).toBe(200); // Verifica que el estado sea 200 (OK)
    expect(response.body.email).toEqual(user.email);
    expect(response.body.name).toEqual(user.name);
  });

  it('Debería devolver un error si el usuario no se encuentra', async () => {
    const response = await request(app.getHttpServer()).get('/users/999'); 

    expect(response.status).toBe(404); 
    expect(response.body.message).toEqual('Usuario no encontrado');
  });

  it('Debería actualizar un usuario existente', async () => {
    const user = await service.create({ name: 'Test User', email: 'test@example.com', password: '123456' });

    const updateData = { name: 'Updated Name' };

    const response = await request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .send(updateData);

    expect(response.status).toBe(200); 
    expect(response.body.name).toEqual(updateData.name);
  });

  it('Debería devolver un error si el usuario no se puede actualizar', async () => {
    const response = await request(app.getHttpServer())
      .put('/users/999') 
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(404); 
    expect(response.body.message).toEqual('Usuario no encontrado');
  });

  it('Debería eliminar un usuario existente', async () => {
    const user = await service.create({ name: 'Test User', email: 'test@example.com', password: '123456' });

    const response = await request(app.getHttpServer()).delete(`/users/${user.id}`);

    expect(response.status).toBe(200); 
    expect(response.body.message).toEqual('Usuario eliminado exitosamente');
  });

  it('Debería devolver un error al eliminar un usuario inexistente', async () => {
    const response = await request(app.getHttpServer()).delete('/users/999'); // Un ID que no existe

    expect(response.status).toBe(404); // Verifica que el estado sea 404 (No encontrado)
    expect(response.body.message).toEqual('Usuario no encontrado');
  });
});
