import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // token generate and verfiy mate
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { StringValue } from 'ms';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    MailModule,
    // Setup JWT
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: {
          expiresIn:
            configService.get<StringValue>('JWT_EXPIRES_IN') || '7d',
        }, // extra option 
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
