import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity'; 

@Module({
  imports: [UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: 'localhost', 
      port: 3306,
      username: 'root', 
      password: 'DarkraiderDx99', 
      database: 'usuarios_db', 
      entities: [User],
      synchronize: true,
    }),
    
  ],
})
export class AppModule {}
