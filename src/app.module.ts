import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpClientModule } from '@nestjs/http-client';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [],
  imports: [
    HttpClientModule.register({
      baseUrl: 'http://172.25.3.20/wpu-gate/apis',
      // baseUrl: 'http://localhost:3001/wpu-gate/apis',
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXRhIjp7ImNvbGxlZ2VJZCI6bnVsbCwiZG9jc1NhdGlzZmllZCI6bnVsbCwicGhvbmUiOm51bGx9LCJuYW1lIjoiQWRtaW4iLCJyb2xlcyI6WyJhZG1pbiJdLCJzdWIiOjMsInR5cGUiOiJzdGFmZiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3ODY0MzM3MDd9._ueslbYsy6771n4dYkZbLV_6CHHrBX_yMQFvd_UcZHw`,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow<string>('APP_JWT_SECRET'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoLoadEntities: true,
        database: 'wpu_staff_clearance',
        host: configService.getOrThrow<string>('APP_DB_HOST'),
        logging: false,
        password: configService.getOrThrow<string>('APP_DB_PASSWORD'),
        port: 3306,
        synchronize: false,
        type: 'mysql',
        username: configService.getOrThrow<string>('APP_DB_USERNAME'),
      }),
    }),
    TypeOrmModule.forFeature([]),
  ],
})
export class AppModule {}
