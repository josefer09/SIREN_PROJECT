import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';
import { User } from '@user/entities/user.entity';
import { Role } from '@role/entities/role.entity';
import { EmailModule } from '@email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Token } from './entities/token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRolesGuard } from './guards/user-roles/user-roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, Role]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '4h',
        } as Record<string, unknown>,
      }),
    }),
    ConfigModule,
    CommonModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserRolesGuard],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
