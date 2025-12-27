import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ProjectsModule } from './projects/projects.module';
import { ScreenTestsModule } from './screen-tests/screen-tests.module';
import { CoreFeaturesModule } from './core-features.module';
import { VerificationModule } from './id-verification/verification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<number>('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Auto-create tables (dev only)
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes env variables accessible everywhere
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    ProjectsModule,
    ScreenTestsModule,
    CoreFeaturesModule,
    VerificationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
